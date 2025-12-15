const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db/pool');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    // 1. Check existing user
    const existing = await db('users')
      .where({ email })
      .orWhere({ phone })
      .first();

    if (existing) {
      return res.status(400).json({ error: 'Email or phone already in use' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user
    const [user] = await db('users')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        password: hashedPassword,
      })
      .returning(['id', 'first_name', 'last_name', 'user_type']);

    // 4. Create token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user,
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});


// ------------------ LOGIN ------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await db('users').where({ email }).first();

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Create token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        subscribed: user.subscribed,
      },
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
