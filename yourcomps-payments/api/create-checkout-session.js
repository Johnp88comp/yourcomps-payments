import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, price, quantity } = req.body;

    // Basic validation
    if (!title || !price || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (isNaN(numericPrice) || isNaN(numericQuantity)) {
      return res.status(400).json({ error: "Invalid price or quantity" });
    }

    // Convert pounds → pence for Stripe
    const unitAmount = Math.round(numericPrice * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: title,
            },
            unit_amount: unitAmount,
          },
          quantity: numericQuantity,
        },
      ],
      success_url: "https://yourcomps.vercel.app/success.html",
      cancel_url: "https://yourcomps.vercel.app/cancel.html",
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message });
  }
}
