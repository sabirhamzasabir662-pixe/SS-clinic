import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/doctors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const doctors = db.queryAll(
      "SELECT * FROM doctors WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY id ASC"
    );
    res.json({ doctors, total: doctors.length });
  } catch (err) {
    console.error('Doctors error:', err);
    res.status(500).json({ message: 'Failed to retrieve doctors' });
  }
});

// POST /api/doctors
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, specialty, qualification, department, experience, avatar, email, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Doctor name is required.' });

    const db = await getDb();
    db.run(
      "INSERT INTO doctors (name, specialty, qualification, department, experience, avatar, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name.trim(),
        specialty || 'Physician',
        qualification || 'MBBS',
        department || 'General Medicine',
        experience || '5 Years',
        avatar || '/assets/doctor_avatar_exact.png',
        email || 'doctor@shifaclinic.com',
        phone || '+92 300 0000000'
      ]
    );
    db.persist();

    const created = db.queryOne("SELECT * FROM doctors ORDER BY id DESC LIMIT 1");
    res.status(201).json({ message: 'Doctor added', doctor: created });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add doctor' });
  }
});

// DELETE /api/doctors/:id (Soft Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = db.queryOne("SELECT id, name FROM doctors WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Doctor not found or already deleted' });
    }

    const deletedBy = req.user?.name || req.user?.username || 'Dr. Shazaib';
    db.run(
      "UPDATE doctors SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?",
      [deletedBy, id]
    );
    db.persist();

    res.json({ message: 'Doctor moved to Recycle Bin', id, name: existing.name });
  } catch (err) {
    console.error('Delete doctor error:', err);
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
});

export default router;
