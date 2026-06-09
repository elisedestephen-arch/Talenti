import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import db from "@/lib/db";
import { getPlanFromPriceId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
    }

    // Vérifier la signature Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
    }

    // Traiter les événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription as string | null;

        if (userId && plan && subscriptionId) {
          // Récupérer les détails de l'abonnement
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          const endDate = new Date(subscription.current_period_end * 1000).toISOString();

          db.prepare(`
            UPDATE users 
            SET plan = ?, stripe_subscription_id = ?, subscription_status = 'active', subscription_end = ?, updated_at = datetime('now')
            WHERE id = ?
          `).run(plan, subscriptionId, endDate, userId);

          // Vérifier si l'utilisateur a été parrainé → créditer le parrain
          const referredUser = db.prepare("SELECT referred_by FROM users WHERE id = ?").get(userId) as any;
          if (referredUser?.referred_by) {
            // Créditer le parrain avec 1 mois gratuit
            const referrer = db.prepare("SELECT referral_credits, free_until FROM users WHERE id = ?").get(referredUser.referred_by) as any;
            if (referrer) {
              const credits = (referrer.referral_credits || 0) + 1;
              
              // Calculer free_until : prolonger de 30 jours
              const currentFreeUntil = referrer.free_until ? new Date(referrer.free_until) : new Date();
              const newFreeUntil = new Date(currentFreeUntil.getTime() + 30 * 24 * 60 * 60 * 1000);
              
              db.prepare(`
                UPDATE users 
                SET referral_credits = ?, free_until = ?, updated_at = datetime('now')
                WHERE id = ?
              `).run(credits, newFreeUntil.toISOString(), referredUser.referred_by);
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string | null;
        if (subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          const endDate = new Date(subscription.current_period_end * 1000).toISOString();
          const priceId = subscription.items.data[0]?.price?.id;
          const planInfo = getPlanFromPriceId(priceId || "");

          if (planInfo) {
            db.prepare(`
              UPDATE users 
              SET subscription_status = 'active', subscription_end = ?, updated_at = datetime('now')
              WHERE stripe_subscription_id = ?
            `).run(endDate, subscriptionId);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const status = subscription.status === "active" || subscription.status === "trialing" ? "active" : "inactive";
        const endDate = new Date(subscription.current_period_end * 1000).toISOString();

        // Si l'abonnement est annulé mais encore actif
        if (subscription.cancel_at_period_end) {
          db.prepare(`
            UPDATE users 
            SET subscription_status = ?, subscription_end = ?, updated_at = datetime('now')
            WHERE stripe_subscription_id = ?
          `).run("canceling", endDate, subscription.id);
        } else {
          const priceId = subscription.items.data[0]?.price?.id;
          const planInfo = getPlanFromPriceId(priceId);

          db.prepare(`
            UPDATE users 
            SET plan = ?, subscription_status = ?, subscription_end = ?, updated_at = datetime('now')
            WHERE stripe_subscription_id = ?
          `).run(planInfo?.plan || "free", status, endDate, subscription.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        db.prepare(`
          UPDATE users 
          SET plan = 'free', stripe_subscription_id = NULL, subscription_status = 'inactive', subscription_end = NULL, updated_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `).run(subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// Stripe webhooks need raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
