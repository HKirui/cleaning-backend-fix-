const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db/pool');

const router = express.Router();

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, user_type } = req.body;

    const existing = await pool.query(
      'SELECT 1 FROM users WHERE email=$1 OR phone=$2',
      [email, phone]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email or phone already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (first_name, last_name, email, phone, password, user_type)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING user_id, first_name, last_name, user_type, subscribed`,
      [first_name, last_name, email, phone, hashedPassword, user_type]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.user_id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/* ---------------- LOGIN ---------------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        subscribed: user.subscribed
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
