import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/diseases?search=&page=&limit=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const db = await getDb();

    let countQuery = "SELECT COUNT(*) as count FROM diseases WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let countParams = [];

    let dataQuery = "SELECT * FROM diseases WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let dataParams = [];

    if (search) {
      countQuery += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(symptoms) LIKE ? OR LOWER(medicines) LIKE ?)";
      const searchParam = `%${search}%`;
      countParams = [searchParam, searchParam, searchParam, searchParam];

      dataQuery += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(symptoms) LIKE ? OR LOWER(medicines) LIKE ?)";
      dataParams = [searchParam, searchParam, searchParam, searchParam];
    }

    dataQuery += " ORDER BY id ASC LIMIT ? OFFSET ?";
    dataParams.push(limit, offset);

    const totalRow = db.queryOne(countQuery, countParams);
    const total = totalRow ? totalRow.count : 0;
    const rows = db.queryAll(dataQuery, dataParams);

    // Format medicines as array of strings
    const diseases = rows.map(r => ({
      ...r,
      medicines: r.medicines ? r.medicines.split(',').map(m => m.trim()) : []
    }));

    res.json({
      diseases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Diseases error:', err);
    res.status(500).json({ message: 'Failed to retrieve diseases' });
  }
});

// POST /api/diseases
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, symptoms, medicines } = req.body;

    if (!name || !description || !symptoms) {
      return res.status(400).json({ message: 'Name, description, and symptoms are required.' });
    }

    const medsString = Array.isArray(medicines) ? medicines.join(', ') : (medicines || '');

    const db = await getDb();
    db.run(
      "INSERT INTO diseases (name, description, symptoms, medicines) VALUES (?, ?, ?, ?)",
      [name.trim(), description.trim(), symptoms.trim(), medsString.trim()]
    );
    db.persist();

    const created = db.queryOne("SELECT * FROM diseases ORDER BY id DESC LIMIT 1");
    res.status(201).json({
      message: 'Disease created successfully',
      disease: {
        ...created,
        medicines: created.medicines ? created.medicines.split(',').map(m => m.trim()) : []
      }
    });
  } catch (err) {
    console.error('Create disease error:', err);
    res.status(500).json({ message: 'Failed to create disease' });
  }
});

// PUT /api/diseases/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, symptoms, medicines } = req.body;

    const db = await getDb();
    const existing = db.queryOne("SELECT * FROM diseases WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    const medsString = Array.isArray(medicines) ? medicines.join(', ') : (medicines || existing.medicines);

    db.run(
      "UPDATE diseases SET name = ?, description = ?, symptoms = ?, medicines = ? WHERE id = ?",
      [
        name ? name.trim() : existing.name,
        description ? description.trim() : existing.description,
        symptoms ? symptoms.trim() : existing.symptoms,
        medsString ? medsString.trim() : existing.medicines,
        id
      ]
    );
    db.persist();

    const updated = db.queryOne("SELECT * FROM diseases WHERE id = ?", [id]);
    res.json({
      message: 'Disease updated successfully',
      disease: {
        ...updated,
        medicines: updated.medicines ? updated.medicines.split(',').map(m => m.trim()) : []
      }
    });
  } catch (err) {
    console.error('Update disease error:', err);
    res.status(500).json({ message: 'Failed to update disease' });
  }
});

// DELETE /api/diseases/:id (Soft Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = db.queryOne("SELECT id, name FROM diseases WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Disease not found or already deleted' });
    }

    const deletedBy = req.user?.name || req.user?.username || 'Dr. Shazaib';
    db.run(
      "UPDATE diseases SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?",
      [deletedBy, id]
    );
    db.persist();

    res.json({ message: 'Disease moved to Recycle Bin', id, name: existing.name });
  } catch (err) {
    console.error('Delete disease error:', err);
    res.status(500).json({ message: 'Failed to delete disease' });
  }
});

export default router;
