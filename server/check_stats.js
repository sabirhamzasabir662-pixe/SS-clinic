import jwt from 'jsonwebtoken';
import { getDb } from './src/db.js';

const db = await getDb();
console.log('Diseases count:', db.queryOne('SELECT COUNT(*) as c FROM diseases WHERE is_deleted = 0 OR is_deleted IS NULL').c);
console.log('Medicines count:', db.queryOne('SELECT COUNT(*) as c FROM medicines WHERE is_deleted = 0 OR is_deleted IS NULL').c);
console.log('Patients count:', db.queryOne('SELECT COUNT(*) as c FROM patients WHERE is_deleted = 0 OR is_deleted IS NULL').c);
console.log('Prescriptions count:', db.queryOne('SELECT COUNT(*) as c FROM prescriptions WHERE is_deleted = 0 OR is_deleted IS NULL').c);
console.log('Recycle bin count:', db.queryOne('SELECT COUNT(*) as c FROM diseases WHERE is_deleted = 1').c);
