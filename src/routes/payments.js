const express = require("express");
const router = express.Router();
const mpesa = require("../utils/mpesa");
const pool = require("../../db/pool");
const auth = require("../middleware/auth");

// SEND STK PUSH
router.post("/subscribe", auth, async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    const response = await mpesa.stkPush({
      phone,
      amount: 100,
      orderId: `SUB-${userId}-${Date.now()}`,
      callbackUrl: process.env.MPESA_CALLBACK_URL
    });

    res.json({ success: true, message: "STK Push sent", data: response });

  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err);
    res.status(500).json({ error: "Payment error" });
  }
});

// CALLBACK FROM SAFARICOM
router.post("/callback", async (req, res) => {
  try {
    const body = req.body;

    const callback = body.Body.stkCallback;

    if (callback.ResultCode === 0) {
      const phone = callback.CallbackMetadata.Item[4].Value;
      
      await pool.query(
        "UPDATE users SET subscribed = true WHERE phone = $1",
        [phone]
      );

      console.log("Subscription updated for:", phone);
    }

    res.json({ message: "Callback received" });

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    res.status(500).json({ error: "Callback error" });
  }
});

module.exports = router;
