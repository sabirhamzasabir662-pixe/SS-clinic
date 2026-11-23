import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to normalize entity type
function normalizeType(type) {
  if (!type) return null;
  const t = type.toLowerCase().trim();
  if (t === 'disease' || t === 'diseases') return 'diseases';
  if (t === 'medicine' || t === 'medicines') return 'medicines';
  if (t === 'patient' || t === 'patients') return 'patients';
  if (t === 'prescription' || t === 'prescriptions') return 'prescriptions';
  if (t === 'appointment' || t === 'appointments') return 'appointments';
  if (t === 'doctor' || t === 'doctors') return 'doctors';
  return null;
}

// GET /api/recycle-bin?type=&q=&page=&limit=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filterType = req.query.type ? req.query.type.toLowerCase().trim() : 'all';
    const q = req.query.q ? req.query.q.toLowerCase().trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const db = await getDb();

    // Query deleted items from all 6 tables
    const deletedDiseases = db.queryAll(
      "SELECT id, name, created_at, deleted_at, deleted_by FROM diseases WHERE is_deleted = 1"
    ).map(d => ({
      id: d.id,
      name: d.name,
      rawName: d.name,
      type: 'Disease',
      typeKey: 'diseases',
      deleted_by: d.deleted_by || 'Dr. Shazaib',
      deleted_at: d.deleted_at || d.created_at
    }));

    const deletedMedicines = db.queryAll(
      "SELECT id, name, category, dosage, created_at, deleted_at, deleted_by FROM medicines WHERE is_deleted = 1"
    ).map(m => ({
      id: m.id,
      name: m.name,
      rawName: m.name,
      type: 'Medicine',
      typeKey: 'medicines',
      deleted_by: m.deleted_by || 'Dr. Shazaib',
      deleted_at: m.deleted_at || m.created_at
    }));

    const deletedPatients = db.queryAll(
      "SELECT id, name, phone, created_at, deleted_at, deleted_by FROM patients WHERE is_deleted = 1"
    ).map(p => ({
      id: p.id,
      name: p.name,
      rawName: p.name,
      type: 'Patient',
      typeKey: 'patients',
      deleted_by: p.deleted_by || 'Dr. Shazaib',
      deleted_at: p.deleted_at || p.created_at
    }));

    const deletedPrescriptions = db.queryAll(
      "SELECT id, rx_id, patient_name, disease, created_at, deleted_at, deleted_by FROM prescriptions WHERE is_deleted = 1"
    ).map(r => ({
      id: r.id,
      name: `${r.rx_id} - ${r.patient_name} (${r.disease})`,
      rawName: r.rx_id,
      type: 'Prescription',
      typeKey: 'prescriptions',
      deleted_by: r.deleted_by || 'Dr. Shazaib',
      deleted_at: r.deleted_at || r.created_at
    }));

    const deletedAppointments = db.queryAll(
      "SELECT id, patient, time, date, type, created_at, deleted_at, deleted_by FROM appointments WHERE is_deleted = 1"
    ).map(a => ({
      id: a.id,
      name: `${a.patient} (${a.type} - ${a.time})`,
      rawName: a.patient,
      type: 'Appointment',
      typeKey: 'appointments',
      deleted_by: a.deleted_by || 'Dr. Shazaib',
      deleted_at: a.deleted_at || a.created_at
    }));

    const deletedDoctors = db.queryAll(
      "SELECT id, name, specialty, created_at, deleted_at, deleted_by FROM doctors WHERE is_deleted = 1"
    ).map(doc => ({
      id: doc.id,
      name: doc.name,
      rawName: doc.name,
      type: 'Doctor',
      typeKey: 'doctors',
      deleted_by: doc.deleted_by || 'Dr. Shazaib',
      deleted_at: doc.deleted_at || doc.created_at
    }));

    // Tab Counts
    const counts = {
      all: deletedDiseases.length + deletedMedicines.length + deletedPatients.length + deletedPrescriptions.length + deletedAppointments.length + deletedDoctors.length,
      diseases: deletedDiseases.length,
      medicines: deletedMedicines.length,
      patients: deletedPatients.length,
      prescriptions: deletedPrescriptions.length,
      appointments: deletedAppointments.length,
      doctors: deletedDoctors.length
    };

    // Combine all
    let allDeleted = [
      ...deletedDiseases,
      ...deletedMedicines,
      ...deletedPatients,
      ...deletedPrescriptions,
      ...deletedAppointments,
      ...deletedDoctors
    ];

    // Calculate auto-delete info for each item (30 days retention)
    const now = Date.now();
    allDeleted = allDeleted.map(item => {
      let daysRemaining = 30;
      if (item.deleted_at) {
        const delTime = new Date(item.deleted_at).getTime();
        if (!isNaN(delTime)) {
          const daysElapsed = Math.floor((now - delTime) / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, 30 - daysElapsed);
        }
      }
      return {
        ...item,
        daysRemaining,
        autoDeleteText: `Auto-deletes in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
      };
    });

    // Filter by type
    if (filterType && filterType !== 'all') {
      allDeleted = allDeleted.filter(item => item.typeKey === filterType);
    }

    // Filter by search query q
    if (q) {
      allDeleted = allDeleted.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.deleted_by.toLowerCase().includes(q)
      );
    }

    // Sort by deleted_at descending
    allDeleted.sort((a, b) => {
      const timeA = new Date(a.deleted_at || 0).getTime();
      const timeB = new Date(b.deleted_at || 0).getTime();
      return timeB - timeA;
    });

    const total = allDeleted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginatedItems = allDeleted.slice(offset, offset + limit);

    res.json({
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      counts
    });
  } catch (err) {
    console.error('Recycle bin list error:', err);
    res.status(500).json({ message: 'Failed to retrieve recycle bin items' });
  }
});

// POST /api/recycle-bin/:type/:id/restore
router.post('/:type/:id/restore', authenticateToken, async (req, res) => {
  try {
    const table = normalizeType(req.params.type);
    const { id } = req.params;
    const { newName } = req.body || {};

    if (!table) {
      return res.status(400).json({ message: `Invalid entity type: ${req.params.type}` });
    }

    const db = await getDb();
    const item = db.queryOne(`SELECT * FROM ${table} WHERE id = ? AND is_deleted = 1`, [id]);
    if (!item) {
      return res.status(404).json({ message: 'Deleted item not found in Recycle Bin.' });
    }

    // Check duplicate active name
    // (Applicable for diseases, medicines, patients, doctors)
    const nameField = (table === 'appointments' ? 'patient' : (table === 'prescriptions' ? 'rx_id' : 'name'));
    const currentName = item[nameField];
    const targetName = (newName && newName.trim()) ? newName.trim() : currentName;

    if (['diseases', 'medicines', 'patients', 'doctors'].includes(table)) {
      const activeMatch = db.queryOne(
        `SELECT id, name FROM ${table} WHERE (is_deleted = 0 OR is_deleted IS NULL) AND LOWER(name) = ? AND id != ?`,
        [targetName.toLowerCase(), id]
      );

      if (activeMatch) {
        if (!newName) {
          // Tell frontend there is a conflict so doctor can rename
          return res.status(409).json({
            conflict: true,
            currentName,
            message: `An active item named "${currentName}" already exists. Please rename it before restoring.`
          });
        } else {
          // If the new name also conflicts
          return res.status(409).json({
            conflict: true,
            currentName,
            message: `The name "${targetName}" is also already in use by an active item. Please choose a different name.`
          });
        }
      }
    }

    // Update name if changed
    if (newName && newName.trim() && ['diseases', 'medicines', 'patients', 'doctors'].includes(table)) {
      db.run(`UPDATE ${table} SET name = ? WHERE id = ?`, [newName.trim(), id]);
    }

    // Restore item
    db.run(
      `UPDATE ${table} SET is_deleted = 0, deleted_at = NULL, deleted_by = NULL WHERE id = ?`,
      [id]
    );

    // If restoring a patient, also restore their prescriptions together
    if (table === 'patients') {
      db.run(
        "UPDATE prescriptions SET is_deleted = 0, deleted_at = NULL, deleted_by = NULL WHERE patient_id = ?",
        [id]
      );
    }

    db.persist();

    res.json({
      message: 'Item restored successfully',
      id,
      type: table,
      name: targetName
    });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ message: 'Failed to restore item' });
  }
});

// DELETE /api/recycle-bin/:type/:id (Permanent Delete)
router.delete('/:type/:id', authenticateToken, async (req, res) => {
  try {
    // Only Administrator (Dr. Shazaib) can permanently delete
    if (req.user?.role !== 'Administrator') {
      return res.status(403).json({
        message: 'Permission denied: Only the Administrator can permanently delete items.'
      });
    }

    const table = normalizeType(req.params.type);
    const { id } = req.params;

    if (!table) {
      return res.status(400).json({ message: `Invalid entity type: ${req.params.type}` });
    }

    const db = await getDb();

    // Cascading permanent delete for patients and prescriptions
    if (table === 'patients') {
      const rxList = db.queryAll("SELECT id FROM prescriptions WHERE patient_id = ?", [id]);
      for (const rx of rxList) {
        db.run("DELETE FROM prescription_items WHERE prescription_id = ?", [rx.id]);
      }
      db.run("DELETE FROM prescriptions WHERE patient_id = ?", [id]);
    } else if (table === 'prescriptions') {
      db.run("DELETE FROM prescription_items WHERE prescription_id = ?", [id]);
    }

    db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    db.persist();

    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    console.error('Permanent delete error:', err);
    res.status(500).json({ message: 'Failed to delete item permanently' });
  }
});

// DELETE /api/recycle-bin (Empty Recycle Bin)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    // Only Administrator (Dr. Shazaib) can empty bin
    if (req.user?.role !== 'Administrator') {
      return res.status(403).json({
        message: 'Permission denied: Only the Administrator can empty the Recycle Bin.'
      });
    }

    const db = await getDb();

    // 1. Delete prescription items for deleted prescriptions
    db.run(`
      DELETE FROM prescription_items 
      WHERE prescription_id IN (SELECT id FROM prescriptions WHERE is_deleted = 1)
    `);

    // 2. Delete prescription items for prescriptions of deleted patients
    db.run(`
      DELETE FROM prescription_items 
      WHERE prescription_id IN (
        SELECT id FROM prescriptions 
        WHERE patient_id IN (SELECT id FROM patients WHERE is_deleted = 1)
      )
    `);

    // 3. Delete from all 6 tables
    const tables = ['diseases', 'medicines', 'patients', 'prescriptions', 'appointments', 'doctors'];
    for (const table of tables) {
      db.run(`DELETE FROM ${table} WHERE is_deleted = 1`);
    }

    db.persist();

    res.json({ message: 'Recycle Bin emptied successfully' });
  } catch (err) {
    console.error('Empty bin error:', err);
    res.status(500).json({ message: 'Failed to empty Recycle Bin' });
  }
});

export default router;
