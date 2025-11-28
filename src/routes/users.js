const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../../db/pool');

const router = express.Router();

// ------------------ LOGGED-IN USER PROFILE ------------------
router.get('/me', auth(), async (req, res) => {
  const { rows } = await pool.query(
    'SELECT user_id, first_name, last_name, email, phone, user_type, subscribed FROM users WHERE user_id=$1',
    [req.user.userId]
  );
  res.json(rows[0]);
});


// ------------------ LIST CLEANERS ------------------
router.get('/cleaners', auth(), async (req, res) => {
  const { rows } = await pool.query(
    "SELECT user_id, first_name, last_name, phone FROM users WHERE user_type='cleaner'"
  );
  res.json(rows);
});


// ------------------ LIST CUSTOMERS ------------------
router.get('/customers', auth('admin'), async (req, res) => {
  const { rows } = await pool.query(
    "SELECT user_id, first_name, last_name, phone FROM users WHERE user_type='customer'"
  );
  res.json(rows);
});

module.exports = router;
