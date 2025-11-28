const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../../db/pool');

const router = express.Router();

// ------------------ LIST ALL USERS ------------------
router.get('/users', auth('admin'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT user_id, first_name, last_name, user_type, subscribed
    FROM users ORDER BY user_id
  `);
  res.json({ users: rows });
});

// ------------------ PENDING SUBSCRIPTIONS ------------------
router.get('/subscriptions/pending', auth('admin'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT * FROM subscriptions WHERE status='pending'
  `);
  res.json({ subscriptions: rows });
});

// ------------------ VERIFY SUBSCRIPTION ------------------
router.post('/subscriptions/:id/verify', auth('admin'), async (req, res) => {
  const { id } = req.params;

  const sub = await pool.query(
    'SELECT * FROM subscriptions WHERE subscription_id=$1',
    [id]
  );

  if (sub.rows.length === 0) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  const userId = sub.rows[0].user_id;

  await pool.query(
    'UPDATE subscriptions SET status=$1 WHERE subscription_id=$2',
    ['verified', id]
  );

  await pool.query(
    'UPDATE users SET subscribed=true WHERE user_id=$1',
    [userId]
  );

  res.json({ success: true });
});

module.exports = router;
