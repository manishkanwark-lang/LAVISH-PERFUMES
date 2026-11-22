
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body || {};

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    return res.status(400).json({ verified: false });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(razorpay_signature, "hex");

  const verified =
    a.length === b.length &&
    crypto.timingSafeEqual(a, b);

  return res.status(verified ? 200 : 400).json({
    verified
  });
};
