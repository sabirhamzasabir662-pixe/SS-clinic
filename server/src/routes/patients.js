import express from 'express';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/patients/search?q=name
// Live search for top bar dropdown
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ patients: [] });
    }

    const db = await getDb();
    const patients = db.queryAll(
      "SELECT id, name, age, gender, phone, address, allergies, blood_group FROM patients WHERE (is_deleted = 0 OR is_deleted IS NULL) AND LOWER(name) LIKE ? ORDER BY name ASC LIMIT 8",
      [`%${q.toLowerCase()}%`]
    );

    // Attach latest diagnosed disease and medicines for each patient
    const results = patients.map(p => {
      const latestRx = db.queryOne(
        "SELECT disease, medicines, date FROM prescriptions WHERE patient_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY date DESC, id DESC LIMIT 1",
        [p.id]
      );

      return {
        ...p,
        bloodGroup: p.blood_group,
        latestDisease: latestRx ? latestRx.disease : 'No records yet',
        latestMedicines: latestRx ? latestRx.medicines : '',
        lastVisitDate: latestRx ? latestRx.date : null
      };
    });

    res.json({ patients: results });
  } catch (err) {
    console.error('Patient search error:', err);
    res.status(500).json({ message: 'Failed to search patients' });
  }
});

// GET /api/patients (paginated list with latest disease & medicines for Patients page table)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default 5 per page
    const offset = (page - 1) * limit;

    const db = await getDb();

    let countQuery = "SELECT COUNT(*) as count FROM patients WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let countParams = [];

    let dataQuery = "SELECT * FROM patients WHERE (is_deleted = 0 OR is_deleted IS NULL)";
    let dataParams = [];

    if (search) {
      countQuery += " AND (LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(blood_group) LIKE ? OR LOWER(allergies) LIKE ?)";
      const sp = `%${search}%`;
      countParams = [sp, sp, sp, sp];

      dataQuery += " AND (LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(blood_group) LIKE ? OR LOWER(allergies) LIKE ?)";
      dataParams = [sp, sp, sp, sp];
    }

    dataQuery += " ORDER BY id ASC LIMIT ? OFFSET ?";
    dataParams.push(limit, offset);

    const totalRow = db.queryOne(countQuery, countParams);
    const total = totalRow ? totalRow.count : 0;
    const patientRows = db.queryAll(dataQuery, dataParams);

    // Enrich each patient row with last diagnosed disease and last medicines given
    const patients = patientRows.map(p => {
      const latestRx = db.queryOne(
        "SELECT disease, medicines, date FROM prescriptions WHERE patient_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY date DESC, id DESC LIMIT 1",
        [p.id]
      );

      let lastMeds = [];
      if (latestRx && latestRx.medicines) {
        lastMeds = latestRx.medicines.split(',').map(m => m.trim()).filter(Boolean);
      }

      return {
        ...p,
        bloodGroup: p.blood_group,
        lastDisease: latestRx ? latestRx.disease : 'None',
        lastMedicines: lastMeds,
        lastVisitDate: latestRx ? latestRx.date : (p.created_at ? p.created_at.split(' ')[0] : '2026-10-20')
      };
    });

    res.json({
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Patients list error:', err);
    res.status(500).json({ message: 'Failed to retrieve patients' });
  }
});

// GET /api/patients/:id
// Returns complete patient profile, all diagnosed diseases, and detailed prescriptions with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const patient = db.queryOne("SELECT * FROM patients WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get all prescriptions for this patient, newest first
    const prescriptions = db.queryAll(
      "SELECT * FROM prescriptions WHERE patient_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY date DESC, id DESC",
      [id]
    );

    // For each prescription, fetch its items
    const prescriptionsWithItems = prescriptions.map(rx => {
      const items = db.queryAll(
        "SELECT * FROM prescription_items WHERE prescription_id = ? ORDER BY id ASC",
        [rx.id]
      );

      return {
        ...rx,
        rxId: rx.rx_id,
        doctor: rx.doctor_name,
        date: rx.date || (rx.created_at ? rx.created_at.split(' ')[0] : '2026-10-27'),
        items: items.map(item => ({
          id: item.id,
          medicineName: item.medicine_name,
          dosage: item.dosage || '500mg',
          frequency: item.frequency || '3 times a day',
          duration: item.duration || '5 days',
          notes: item.notes || 'Take after meals'
        }))
      };
    });

    // Extract distinct diagnosed diseases with their dates
    const diseaseMap = new Map();
    prescriptionsWithItems.forEach(rx => {
      if (rx.disease && !diseaseMap.has(rx.disease)) {
        diseaseMap.set(rx.disease, {
          diseaseName: rx.disease,
          firstDiagnosedDate: rx.date,
          latestDate: rx.date,
          doctor: rx.doctor,
          prescriptionId: rx.id
        });
      }
    });

    const diseasesList = Array.from(diseaseMap.values());

    res.json({
      patient: {
        ...patient,
        bloodGroup: patient.blood_group,
        address: patient.address || 'Not specified',
        allergies: patient.allergies || 'None'
      },
      diseases: diseasesList,
      prescriptions: prescriptionsWithItems
    });
  } catch (err) {
    console.error('Patient detail error:', err);
    res.status(500).json({ message: 'Failed to retrieve patient details' });
  }
});

// POST /api/patients
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, age, gender, phone, address, allergies, bloodGroup } = req.body;
    if (!name) return res.status(400).json({ message: 'Patient name is required.' });

    const db = await getDb();
    db.run(
      "INSERT INTO patients (name, age, gender, phone, address, allergies, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name.trim(),
        parseInt(age) || 30,
        gender || 'Male',
        phone ? phone.trim() : '',
        address ? address.trim() : 'House 1, SS Clinic Road',
        allergies ? allergies.trim() : 'None',
        bloodGroup || 'O+'
      ]
    );
    db.persist();

    const created = db.queryOne("SELECT * FROM patients ORDER BY id DESC LIMIT 1");
    res.status(201).json({ message: 'Patient registered', patient: created });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register patient' });
  }
});

// PUT /api/patients/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, phone, address, allergies, bloodGroup } = req.body;

    const db = await getDb();
    const existing = db.queryOne("SELECT * FROM patients WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    db.run(
      "UPDATE patients SET name = ?, age = ?, gender = ?, phone = ?, address = ?, allergies = ?, blood_group = ? WHERE id = ?",
      [
        name ? name.trim() : existing.name,
        age !== undefined ? parseInt(age) : existing.age,
        gender || existing.gender,
        phone !== undefined ? phone.trim() : existing.phone,
        address !== undefined ? address.trim() : existing.address,
        allergies !== undefined ? allergies.trim() : existing.allergies,
        bloodGroup || existing.blood_group,
        id
      ]
    );
    db.persist();

    const updated = db.queryOne("SELECT * FROM patients WHERE id = ?", [id]);
    res.json({ message: 'Patient updated', patient: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id (Soft Delete patient and their prescriptions)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = db.queryOne("SELECT id, name FROM patients WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Patient not found or already deleted' });
    }

    const deletedBy = req.user?.name || req.user?.username || 'Dr. Shazaib';

    // 1. Soft delete patient
    db.run(
      "UPDATE patients SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id = ?",
      [deletedBy, id]
    );

    // 2. Also hide patient's prescriptions (soft delete them together)
    db.run(
      "UPDATE prescriptions SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE patient_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)",
      [deletedBy, id]
    );

    db.persist();

    res.json({ message: 'Patient moved to Recycle Bin', id, name: existing.name });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ message: 'Failed to delete patient' });
  }
});

export default router;
