const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../../db/pool');
const { stkPush } = require('../utils/mpesa');

const router = express.Router();

// ------------------ SUBSCRIPTION MPESA PAYMENT ------------------
router.post('/subscribe', auth(), async (req, res) => {
  const { phone } = req.body;

  const amount = process.env.SUBSCRIPTION_AMOUNT;

  const response = await stkPush(phone, amount);

  res.json({
    success: true,
    message: 'STK Push sent. Complete payment on your phone.',
    mpesa: response
  });
});

// ------------------ MPESA CALLBACK ------------------
router.post('/mpesa/callback', async (req, res) => {
  console.log("M-PESA CALLBACK RECEIVED ⬇⬇⬇");
  console.log(JSON.stringify(req.body, null, 2));

  // You can save payment logs here if needed.

  res.json({ success: true });
});

module.exports = router;
