import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import db from "@/lib/db";
import stripe from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const dbUser = db.prepare(`
      SELECT id, email, name, plan, subscription_status, subscription_end, stripe_subscription_id, referral_code, referral_count
      FROM users WHERE id = ?
    `).get(user.userId) as any;

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      plan: dbUser.plan,
      subscriptionStatus: dbUser.subscription_status || "inactive",
      subscriptionEnd: dbUser.subscription_end,
      referralCode: dbUser.referral_code,
      referralCount: dbUser.referral_count || 0,
    });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json(
        { plan: "free", subscriptionStatus: "inactive", subscriptionEnd: null, referralCode: null, referralCount: 0 },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === "cancel") {
      // Annuler l'abonnement à la fin de la période
      const dbUser = db.prepare("SELECT stripe_subscription_id FROM users WHERE id = ?").get(user.userId) as any;
      if (!dbUser?.stripe_subscription_id) {
        return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 400 });
      }

      await stripe.subscriptions.update(dbUser.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      db.prepare("UPDATE users SET subscription_status = 'canceling', updated_at = datetime('now') WHERE id = ?").run(user.userId);

      return NextResponse.json({ message: "Abonnement annulé. Vous conservez l'accès jusqu'à la fin de la période." });
    }

    if (action === "reactivate") {
      // Réactiver un abonnement en cours d'annulation
      const dbUser = db.prepare("SELECT stripe_subscription_id FROM users WHERE id = ?").get(user.userId) as any;
      if (!dbUser?.stripe_subscription_id) {
        return NextResponse.json({ error: "Aucun abonnement" }, { status: 400 });
      }

      await stripe.subscriptions.update(dbUser.stripe_subscription_id, {
        cancel_at_period_end: false,
      });

      db.prepare("UPDATE users SET subscription_status = 'active', updated_at = datetime('now') WHERE id = ?").run(user.userId);

      return NextResponse.json({ message: "Abonnement réactivé !" });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
