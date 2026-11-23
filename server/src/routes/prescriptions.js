import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/prescriptions?search=&page=&limit=
router.get('/', authenticateToken, async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const db = await getDb();

    let countQuery = "SELECT COUNT(*) as count FROM prescriptions WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let countParams = [];

    let dataQuery = "SELECT * FROM prescriptions WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let dataParams = [];

    if (search) {
      countQuery += " AND (LOWER(patient_name) LIKE ? OR LOWER(rx_id) LIKE ? OR LOWER(disease) LIKE ? OR LOWER(medicines) LIKE ?)";
      const sp = `%${search}%`;
      countParams = [sp, sp, sp, sp];

      dataQuery += " AND (LOWER(patient_name) LIKE ? OR LOWER(rx_id) LIKE ? OR LOWER(disease) LIKE ? OR LOWER(medicines) LIKE ?)";
      dataParams = [sp, sp, sp, sp];
    }

    dataQuery += " ORDER BY date DESC, id DESC LIMIT ? OFFSET ?";
    dataParams.push(limit, offset);

    const totalRow = db.queryOne(countQuery, countParams);
    const total = totalRow ? totalRow.count : 0;
    const prescriptions = db.queryAll(dataQuery, dataParams);

    const enrichedPrescriptions = prescriptions.map(r => {
      const items = db.queryAll(
        "SELECT * FROM prescription_items WHERE prescription_id = ? ORDER BY id ASC",
        [r.id]
      );

      return {
        ...r,
        rxId: r.rx_id,
        patient: r.patient_name,
        doctor: r.doctor_name,
        date: r.date || (r.created_at ? r.created_at.split(' ')[0] : '2026-10-27'),
        items: items.map(item => ({
          id: item.id,
          medicineName: item.medicine_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          notes: item.notes
        }))
      };
    });

    res.json({
      prescriptions: enrichedPrescriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Prescriptions error:', err);
    res.status(500).json({ message: 'Failed to retrieve prescriptions' });
  }
});

// POST /api/prescriptions
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, patientName, diseaseId, disease, medicines, items, doctorName, date } = req.body;

    const db = await getDb();

    // Determine patient
    let pId = patientId;
    let pName = patientName;

    if (pId && !pName) {
      const p = db.queryOne("SELECT name FROM patients WHERE id = ?", [pId]);
      if (p) pName = p.name;
    } else if (!pId && pName) {
      const p = db.queryOne("SELECT id FROM patients WHERE LOWER(name) = ?", [pName.trim().toLowerCase()]);
      if (p) pId = p.id;
    }

    if (!pName) {
      return res.status(400).json({ message: 'Patient name or ID is required.' });
    }

    // Determine disease
    let dName = disease || 'General Consultation';
    let dId = diseaseId;
    if (dId && !disease) {
      const d = db.queryOne("SELECT name FROM diseases WHERE id = ?", [dId]);
      if (d) dName = d.name;
    }

    // Generate RX ID
    const countRow = db.queryOne("SELECT COUNT(*) as count FROM prescriptions");
    const nextNum = (countRow ? countRow.count : 0) + 7801;
    const rxId = `RX-${nextNum}`;

    // Construct medicines string from items or medicines input
    let medsSummary = medicines || '';
    if (Array.isArray(items) && items.length > 0) {
      medsSummary = items.map(i => i.medicineName || i.name).join(', ');
    }

    const todayDate = date || new Date().toISOString().split('T')[0];
    const docName = doctorName || 'Dr. Shazaib';

    db.run(
      "INSERT INTO prescriptions (rx_id, patient_id, patient_name, disease_id, disease, medicines, doctor_name, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [rxId, pId || null, pName.trim(), dId || null, dName.trim(), medsSummary.trim(), docName, 'Active', todayDate]
    );

    const created = db.queryOne("SELECT * FROM prescriptions ORDER BY id DESC LIMIT 1");

    // Insert prescription items
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const medName = item.medicineName || item.name;
        if (!medName) continue;

        const medObj = db.queryOne("SELECT id FROM medicines WHERE LOWER(name) = ?", [medName.trim().toLowerCase()]);

        db.run(
          "INSERT INTO prescription_items (prescription_id, medicine_id, medicine_name, dosage, frequency, duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            created.id,
            medObj ? medObj.id : null,
            medName.trim(),
            item.dosage || '500mg',
            item.frequency || '3 times a day',
            item.duration || '5 days',
            item.notes || 'Take after meals'
          ]
        );
      }
    }

    db.persist();

    // Fetch complete newly created prescription with items
    const insertedItems = db.queryAll("SELECT * FROM prescription_items WHERE prescription_id = ?", [created.id]);

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: {
        ...created,
        rxId: created.rx_id,
        items: insertedItems
      }
    });
  } catch (err) {
    console.error('Prescription creation error:', err);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
});

// DELETE /api/prescriptions/:id (Soft Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const existing = db.queryOne("SELECT id, rx_id, patient_name FROM prescriptions WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Prescription not found or already deleted' });
    }

    const deletedBy = req.user?.name || req.user?.username || 'Dr. Shazaib';
    db.run(
      "UPDATE prescriptions SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?",
      [deletedBy, id]
    );
    db.persist();

    res.json({ message: 'Prescription moved to Recycle Bin', id, name: `${existing.rx_id} (${existing.patient_name})` });
  } catch (err) {
    console.error('Delete prescription error:', err);
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
});

export default router;
