import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../clinic.sqlite');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(filebuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Helper method to persist to disk
  dbInstance.persist = () => {
    try {
      const data = dbInstance.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
    } catch (err) {
      console.error('Failed to save DB to disk:', err);
    }
  };

  // Helper to run query with parameters
  dbInstance.runSql = (sql, params = []) => {
    dbInstance.run(sql, params);
    dbInstance.persist();
  };

  // Helper to query all rows as array of objects
  dbInstance.queryAll = (sql, params = []) => {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  // Helper to query single row as object
  dbInstance.queryOne = (sql, params = []) => {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(params);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  };

  return dbInstance;
}

export async function initSchema() {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Administrator',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS diseases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      medicines TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      dosage TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      allergies TEXT,
      blood_group TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rx_id TEXT NOT NULL,
      patient_id INTEGER,
      patient_name TEXT NOT NULL,
      disease_id INTEGER,
      disease TEXT NOT NULL,
      medicines TEXT NOT NULL,
      doctor_name TEXT NOT NULL DEFAULT 'Dr. Shazaib',
      status TEXT NOT NULL DEFAULT 'Active',
      date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescription_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      medicine_id INTEGER,
      medicine_name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      duration TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient TEXT NOT NULL,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      doctor TEXT NOT NULL DEFAULT 'Dr. Shazaib',
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      deleted_by TEXT
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      qualification TEXT NOT NULL,
      department TEXT NOT NULL,
      experience TEXT NOT NULL,
      avatar TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      deleted_by TEXT
    );
  `);

  // Run safe column migrations for existing databases to support soft deletes & new columns
  const tables = ['diseases', 'medicines', 'patients', 'prescriptions', 'appointments', 'doctors'];
  for (const table of tables) {
    try {
      const cols = db.queryAll(`PRAGMA table_info(${table})`).map(c => c.name);
      if (!cols.includes('is_deleted')) {
        db.run(`ALTER TABLE ${table} ADD COLUMN is_deleted INTEGER DEFAULT 0`);
      }
      if (!cols.includes('deleted_at')) {
        db.run(`ALTER TABLE ${table} ADD COLUMN deleted_at DATETIME`);
      }
      if (!cols.includes('deleted_by')) {
        db.run(`ALTER TABLE ${table} ADD COLUMN deleted_by TEXT`);
      }
    } catch (err) {
      console.warn(`Migration check for ${table}:`, err.message);
    }
  }

  try {
    const patientCols = db.queryAll("PRAGMA table_info(patients)").map(c => c.name);
    if (!patientCols.includes('address')) {
      db.run("ALTER TABLE patients ADD COLUMN address TEXT");
    }
    if (!patientCols.includes('allergies')) {
      db.run("ALTER TABLE patients ADD COLUMN allergies TEXT");
    }

    const rxCols = db.queryAll("PRAGMA table_info(prescriptions)").map(c => c.name);
    if (!rxCols.includes('patient_id')) {
      db.run("ALTER TABLE prescriptions ADD COLUMN patient_id INTEGER");
    }
    if (!rxCols.includes('disease_id')) {
      db.run("ALTER TABLE prescriptions ADD COLUMN disease_id INTEGER");
    }
    if (!rxCols.includes('date')) {
      db.run("ALTER TABLE prescriptions ADD COLUMN date TEXT");
    }
  } catch (err) {
    console.warn('Migration warning:', err.message);
  }

  db.persist();
  return db;
}

// Auto Cleanup: Permanently deletes items in the bin older than 30 days
export async function runAutoCleanup() {
  try {
    const db = await getDb();
    console.log('[Auto-Cleanup] Checking for recycle bin items older than 30 days...');

    // 1. Clean prescription items of prescriptions older than 30 days
    db.run(`
      DELETE FROM prescription_items 
      WHERE prescription_id IN (
        SELECT id FROM prescriptions 
        WHERE is_deleted = 1 AND datetime(deleted_at) <= datetime('now', '-30 days')
      )
    `);

    // 2. Clean prescriptions of patients deleted > 30 days
    db.run(`
      DELETE FROM prescription_items 
      WHERE prescription_id IN (
        SELECT id FROM prescriptions 
        WHERE patient_id IN (
          SELECT id FROM patients 
          WHERE is_deleted = 1 AND datetime(deleted_at) <= datetime('now', '-30 days')
        )
      )
    `);

    // 3. Delete from all 6 main tables
    const tables = ['diseases', 'medicines', 'patients', 'prescriptions', 'appointments', 'doctors'];
    for (const table of tables) {
      db.run(`DELETE FROM ${table} WHERE is_deleted = 1 AND datetime(deleted_at) <= datetime('now', '-30 days')`);
    }

    db.persist();
    console.log('[Auto-Cleanup] Recycle bin cleanup completed.');
  } catch (err) {
    console.error('[Auto-Cleanup] Error during auto-cleanup:', err);
  }
}
