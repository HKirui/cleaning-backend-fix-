const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db/pool');

const router = express.Router();

/* ---------------- REGISTER ---------------- */
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, user_type } = req.body;

    const existing = await db('users')
      .where({ email })
      .orWhere({ phone })
      .first();

    if (existing) {
      return res.status(400).json({ error: 'Email or phone already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db('users')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        password: hashedPassword,
        user_type 
      })
      .returning(['id', 'first_name', 'last_name', 'user_type']);

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
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- LOGIN ---------------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
