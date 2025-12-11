const express = require("express");
const router = express.Router();
const mpesa = require("../utils/mpesa");
const pool = require("../../db/pool");
const auth = require("../middleware/auth");

// -----------------------------------------------------
// 1️⃣ SEND STK PUSH
// -----------------------------------------------------
router.post("/subscribe", auth, async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    if (!phone) return res.status(400).json({ error: "Phone is required" });

    const orderId = `SUB-${userId}-${Date.now()}`;

    const response = await mpesa.stkPush({
      phone,
      amount: 100,
      orderId,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
    });

    console.log("STK PUSH RESPONSE:", response);

    res.json({
      success: true,
      message: "STK Push sent successfully",
      checkoutRequestID: response.CheckoutRequestID,
    });

  } catch (err) {
    console.error("STK PUSH ERROR:", err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// -----------------------------------------------------
// 2️⃣ SAFARICOM CALLBACK (AFTER PAYMENT SUCCESS)
// -----------------------------------------------------
router.post("/callback", async (req, res) => {
  try {
    const callback = req.body.Body.stkCallback;

    console.log("FULL CALLBACK RECEIVED:", JSON.stringify(callback, null, 2));

    if (callback.ResultCode !== 0) {
      console.log("Payment failed:", callback.ResultDesc);
      return res.json({ message: "Payment failed" });
    }

    // Extract phone number from callback metadata
    const items = callback.CallbackMetadata?.Item || [];
    const phoneItem = items.find((x) => x.Name === "PhoneNumber");

    if (!phoneItem) {
      console.error("❌ Phone not found in callback");
      return res.json({ message: "Callback received but phone missing" });
    }

    const phone = phoneItem.Value;

    // Update user subscription
    await pool.query(
      "UPDATE users SET subscribed = true WHERE phone = $1",
      [String(phone)]
    );

    console.log("✅ SUBSCRIPTION UPDATED FOR:", phone);

    res.json({ message: "Callback processed successfully" });

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    res.status(500).json({ error: "Callback processing failed" });
  }
});

module.exports = router;
