import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const appointments = db.queryAll(
      "SELECT * FROM appointments WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY id ASC"
    );
    res.json({ appointments, total: appointments.length });
  } catch (err) {
    console.error('Appointments error:', err);
    res.status(500).json({ message: 'Failed to retrieve appointments' });
  }
});

// POST /api/appointments
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patient, time, date, doctor, type, status } = req.body;
    if (!patient) return res.status(400).json({ message: 'Patient name is required.' });

    const db = await getDb();
    db.run(
      "INSERT INTO appointments (patient, time, date, doctor, type, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        patient.trim(),
        time || '10:00 AM',
        date || 'Today',
        doctor || 'Dr. Shazaib',
        type || 'General Checkup',
        status || 'Confirmed'
      ]
    );
    db.persist();

    const created = db.queryOne("SELECT * FROM appointments ORDER BY id DESC LIMIT 1");
    res.status(201).json({ message: 'Appointment booked', appointment: created });
  } catch (err) {
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// DELETE /api/appointments/:id (Soft Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = db.queryOne("SELECT id, patient, type FROM appointments WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Appointment not found or already deleted' });
    }

    const deletedBy = req.user?.name || req.user?.username || 'Dr. Shazaib';
    db.run(
      "UPDATE appointments SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?",
      [deletedBy, id]
    );
    db.persist();

    res.json({ message: 'Appointment moved to Recycle Bin', id, name: `${existing.patient} (${existing.type})` });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
});

export default router;
