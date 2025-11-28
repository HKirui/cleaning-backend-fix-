const axios = require('axios');
const moment = require('moment');

/**
 * Generate Safaricom OAuth token
 */
async function generateToken() {
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    return data.access_token;
  } catch (error) {
    console.error("MPESA TOKEN ERROR:", error.response?.data || error.message);
    throw new Error("Failed to generate MPESA token");
  }
}

/**
 * Send STK Push
 */
async function stkPush(phone, amount) {
  const token = await generateToken();

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  // Clean phone number: convert 07xx -> 2547xx
  let phoneFormatted = phone.trim();
  if (phoneFormatted.startsWith("07")) {
    phoneFormatted = "254" + phoneFormatted.substring(1);
  }

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Number(amount),
    PartyA: phoneFormatted,
    PartyB: shortcode,
    PhoneNumber: phoneFormatted,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: "CleaningPlatformSubscription",
    TransactionDesc: "Subscription Payment"
  };

  try {
    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("MPESA STK PUSH RESPONSE:", data);
    return data;

  } catch (error) {
    console.error("MPESA STK ERROR:", error.response?.data || error.message);
    throw new Error("STK Push Failed");
  }
}

module.exports = {
  stkPush
};
