import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { title, price, quantity } = req.body;

    const unitAmount = Number(price);
    const qty = Number(quantity || 1);

    if (!unitAmount || isNaN(unitAmount)) {
      return res.status(400).send("Invalid price");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: title || "Competition Entry"
            },
            unit_amount: unitAmount
          },
          quantity: qty
        }
      ],
      success_url: "https://yourcomps.vercel.app/success.html",
      cancel_url: "https://yourcomps.vercel.app/cancel.html"
    });

    // 🔑 REDIRECT — no JS needed
    res.writeHead(303, { Location: session.url });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Stripe error");
  }
}
