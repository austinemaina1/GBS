// GBS quote-form handler.
// Receives the contact page's quote request and sends an SMS notification
// via Africa's Talking. Runs as a Netlify serverless function so the
// Africa's Talking credentials never reach the browser.
//
// Required environment variables (set in Netlify: Site settings > Environment variables):
//   AT_USERNAME     — Africa's Talking app username ("sandbox" while testing)
//   AT_API_KEY      — Africa's Talking API key for that app
//   NOTIFY_PHONE    — where to send the SMS, e.g. +254799636482

const AfricasTalking = require("africastalking");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const name = (data.name || "").trim();
  const phone = (data.phone || "").trim();
  const material = (data.material || "").trim();
  const quantity = (data.quantity || "").trim();
  const location = (data.location || "").trim();
  const message = (data.message || "").trim();

  if (!name || !phone || !material || !location) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  const { AT_USERNAME, AT_API_KEY, NOTIFY_PHONE } = process.env;
  if (!AT_USERNAME || !AT_API_KEY || !NOTIFY_PHONE) {
    console.error("Missing Africa's Talking environment variables");
    return { statusCode: 500, body: JSON.stringify({ error: "Server not configured" }) };
  }

  const smsText = [
    "New GBS quote request:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Material: ${material}`,
    quantity ? `Qty: ${quantity}` : null,
    `Location: ${location}`,
    message ? `Notes: ${message}` : null,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 640); // keep well within a few SMS segments

  try {
    const africastalking = AfricasTalking({ username: AT_USERNAME, apiKey: AT_API_KEY });
    const sms = africastalking.SMS;
    await sms.send({ to: [NOTIFY_PHONE], message: smsText });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Africa's Talking send failed:", err);
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to send SMS" }),
    };
  }
};
