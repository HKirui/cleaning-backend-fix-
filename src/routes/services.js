const express = require('express');
const pool = require('../../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// ------------------ LIST ALL ACTIVE SERVICES ------------------
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT s.*, u.first_name, u.last_name
    FROM services s
    JOIN users u ON u.user_id = s.cleaner_id
    WHERE s.is_active = true
  `);
  res.json(rows);
});

// ------------------ CLEANER CREATES SERVICE ------------------
router.post('/', auth('cleaner'), async (req, res) => {
  const { service_name, description, category, base_price, duration_hours, service_area } = req.body;

  await pool.query(
    `INSERT INTO services 
     (cleaner_id, service_name, description, category, base_price, duration_hours, service_area)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      req.user.userId,
      service_name,
      description,
      category,
      base_price,
      duration_hours,
      service_area
    ]
  );

  res.json({ success: true });
});

// ------------------ CLEANER UPDATES SERVICE ------------------
router.put('/:id', auth('cleaner'), async (req, res) => {
  const { id } = req.params;

  await pool.query(
    `UPDATE services SET 
     service_name=$1, description=$2, category=$3, base_price=$4, duration_hours=$5, service_area=$6
     WHERE service_id=$7 AND cleaner_id=$8`,
    [
      req.body.service_name,
      req.body.description,
      req.body.category,
      req.body.base_price,
      req.body.duration_hours,
      req.body.service_area,
      id,
      req.user.userId
    ]
  );

  res.json({ success: true });
});

module.exports = router;
