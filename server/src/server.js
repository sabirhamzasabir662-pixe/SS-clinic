import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initSchema, runAutoCleanup } from './db.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';
import diseasesRoutes from './routes/diseases.js';
import medicinesRoutes from './routes/medicines.js';
import patientsRoutes from './routes/patients.js';
import prescriptionsRoutes from './routes/prescriptions.js';
import appointmentsRoutes from './routes/appointments.js';
import doctorsRoutes from './routes/doctors.js';
import recycleBinRoutes from './routes/recycleBin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/diseases', diseasesRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/recycle-bin', recycleBinRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', clinic: 'SS Shifa Clinic API' });
});

// Startup sequence
async function startServer() {
  try {
    console.log('Initializing SQLite database schema...');
    await initSchema();

    console.log('Checking and seeding clinic data...');
    await seedDatabase();

    // Run auto cleanup for items older than 30 days
    await runAutoCleanup();
    // Daily scheduled auto cleanup (every 24 hours)
    setInterval(() => {
      runAutoCleanup();
    }, 24 * 60 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`SS Shifa Clinic Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log(`Default Admin: shazaib / admin123`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  }
}

startServer();
