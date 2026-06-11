import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import stripe, { PRICES } from "@/lib/stripe";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { plan, interval } = await req.json();

    // Valider les paramètres
    const validPlans = ["premium", "pro"];
    const validIntervals = ["month", "year"];

    if (!validPlans.includes(plan) || !validIntervals.includes(interval)) {
      return NextResponse.json({ error: "Plan ou intervalle invalide" }, { status: 400 });
    }

    // Récupérer ou créer le client Stripe
    const dbUser = db.prepare("SELECT stripe_customer_id, email, name FROM users WHERE id = ?").get(user.userId) as any;
    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    let customerId = dbUser.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: { userId: user.userId },
      });
      customerId = customer.id;
      db.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").run(customerId, user.userId);
    }

    // Configurer le prix selon le plan
    const priceKey = `${plan}_${interval}` as keyof typeof PRICES;
    const priceConfig = PRICES[priceKey];

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: plan === "premium" ? "Talenti Premium" : "Talenti Pro",
              description:
                interval === "year"
                  ? `Abonnement ${plan === "premium" ? "Premium" : "Pro"} annuel (économisez 25%)`
                  : `Abonnement ${plan === "premium" ? "Premium" : "Pro"} mensuel`,
            },
            unit_amount: priceConfig.price, // en centimes
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.userId,
        plan,
        interval,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?subscription=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 });
    }
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du paiement" }, { status: 500 });
  }
}
