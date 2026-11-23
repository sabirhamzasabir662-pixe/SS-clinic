import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/medicines?search=&page=&limit=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const db = await getDb();

    let countQuery = "SELECT COUNT(*) as count FROM medicines WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let countParams = [];

    let dataQuery = "SELECT * FROM medicines WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let dataParams = [];

    if (search) {
      countQuery += " AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(dosage) LIKE ?)";
      const sp = `%${search}%`;
      countParams = [sp, sp, sp];

      dataQuery += " AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(dosage) LIKE ?)";
      dataParams = [sp, sp, sp];
    }

    dataQuery += " ORDER BY id ASC LIMIT ? OFFSET ?";
    dataParams.push(limit, offset);

    const totalRow = db.queryOne(countQuery, countParams);
    const total = totalRow ? totalRow.count : 0;
    const medicines = db.queryAll(dataQuery, dataParams);

    res.json({
      medicines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Medicines error:', err);
    res.status(500).json({ message: 'Failed to retrieve medicines' });
  }
});

// POST /api/medicines
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, dosage, stock } = req.body;
    if (!name) return res.status(400).json({ message: 'Medicine name is required.' });

    const db = await getDb();
    db.run(
      "INSERT INTO medicines (name, category, dosage, stock) VALUES (?, ?, ?, ?)",
      [name.trim(), category || 'General', dosage || '500mg', stock || 100]
    );
    db.persist();

    const created = db.queryOne("SELECT * FROM medicines ORDER BY id DESC LIMIT 1");
    res.status(201).json({ message: 'Medicine added', medicine: created });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add medicine' });
  }
});

// DELETE /api/medicines/:id (Soft Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = db.queryOne("SELECT id, name FROM medicines WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Medicine not found or already deleted' });
    }

    const deletedBy = req.user?.name || req.user?.username || 'Dr. Shazaib';
    db.run(
      "UPDATE medicines SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?",
      [deletedBy, id]
    );
    db.persist();

    res.json({ message: 'Medicine moved to Recycle Bin', id, name: existing.name });
  } catch (err) {
    console.error('Delete medicine error:', err);
    res.status(500).json({ message: 'Failed to delete medicine' });
  }
});

export default router;
