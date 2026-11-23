import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ss_shifa_clinic_super_secret_jwt_key_2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = await getDb();
    const user = db.queryOne("SELECT * FROM users WHERE username = ?", [username.trim()]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username, and password are required.' });
    }

    const db = await getDb();
    const existing = db.queryOne("SELECT id FROM users WHERE username = ?", [username.trim()]);
    if (existing) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    db.run(
      "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), username.trim(), email ? email.trim() : null, hashedPassword, role || 'Staff']
    );
    db.persist();

    res.status(201).json({ message: 'Account created successfully. You can now log in.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = db.queryOne("SELECT id, name, username, email, role FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

export default router;
