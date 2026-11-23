import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const diseasesRow = db.queryOne("SELECT COUNT(*) as count FROM diseases WHERE (is_deleted = 0 OR is_deleted IS NULL)");
    const medicinesRow = db.queryOne("SELECT COUNT(*) as count FROM medicines WHERE (is_deleted = 0 OR is_deleted IS NULL)");
    const patientsRow = db.queryOne("SELECT COUNT(*) as count FROM patients WHERE (is_deleted = 0 OR is_deleted IS NULL)");
    const prescriptionsRow = db.queryOne("SELECT COUNT(*) as count FROM prescriptions WHERE (is_deleted = 0 OR is_deleted IS NULL)");

    res.json({
      totalDiseases: diseasesRow ? diseasesRow.count : 0,
      totalMedicines: medicinesRow ? medicinesRow.count : 0,
      totalPatients: patientsRow ? patientsRow.count : 0,
      totalPrescriptions: prescriptionsRow ? prescriptionsRow.count : 0
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Failed to calculate stats' });
  }
});

export default router;
