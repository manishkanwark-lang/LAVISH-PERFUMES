
const Razorpay = require("razorpay");

const PRODUCTS = [
  "Oud Royal",
  "Vanilla Noir",
  "Fleur Blanche",
  "Marshmallow",
  "Lucid",
  "Tobacco",
  "Caramel",
  "Cocodak",
  "Fire Night",
  "Elixir Vampire"
];

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product, size } = req.body || {};

  if (!PRODUCTS.includes(product) ||
      !["50 ml", "100 ml"].includes(size)) {
    return res.status(400).json({ error: "Invalid product or size" });
  }

  if (!process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: "Payment keys missing" });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = size === "50 ml" ? 59900 : 120000;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "lavish_" + Date.now(),
      notes: { product, size }
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Payment order creation failed"
    });
  }
};
