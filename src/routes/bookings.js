const express = require('express');
const pool = require('../../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// ------------------ CUSTOMER CREATES BOOKING ------------------
router.post('/', auth('customer'), async (req, res) => {
  const { service_id, booking_date, booking_time } = req.body;

  const s = await pool.query(
    'SELECT cleaner_id, base_price FROM services WHERE service_id=$1',
    [service_id]
  );

  if (s.rows.length === 0) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const { cleaner_id, base_price } = s.rows[0];

  const b = await pool.query(
    `INSERT INTO bookings
     (customer_id, cleaner_id, service_id, booking_date, booking_time, total_amount)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      req.user.userId,
      cleaner_id,
      service_id,
      booking_date,
      booking_time,
      base_price
    ]
  );

  res.json({ success: true, booking: b.rows[0] });
});

// ------------------ CUSTOMER VIEW BOOKINGS ------------------
router.get('/customer', auth('customer'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT b.*, s.service_name, u.first_name AS cleaner_first, u.last_name AS cleaner_last
    FROM bookings b
    JOIN services s ON s.service_id = b.service_id
    JOIN users u ON u.user_id = b.cleaner_id
    WHERE b.customer_id=$1
  `, [req.user.userId]);

  res.json(rows);
});

// ------------------ CLEANER VIEW BOOKINGS ------------------
router.get('/cleaner', auth('cleaner'), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT b.*, s.service_name, u.first_name AS customer_first, u.last_name AS customer_last
    FROM bookings b
    JOIN services s ON s.service_id = b.service_id
    JOIN users u ON u.user_id = b.customer_id
    WHERE b.cleaner_id=$1
  `, [req.user.userId]);

  res.json(rows);
});

// ------------------ CLEANER UPDATE STATUS ------------------
router.put('/:id/status', auth('cleaner'), async (req, res) => {
  const { status } = req.body;

  await pool.query(
    `UPDATE bookings SET status=$1 WHERE booking_id=$2 AND cleaner_id=$3`,
    [status, req.params.id, req.user.userId]
  );

  res.json({ success: true });
});

module.exports = router;
