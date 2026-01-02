import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const { title, price, quantity } = req.query;

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

    // ✅ HARD REDIRECT TO STRIPE
    res.writeHead(302, { Location: session.url });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Stripe error");
  }
}
