import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { signToken } from "@/lib/auth";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, referralCode } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = generateReferralCode();

    // Vérifier le code de parrainage
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = db.prepare("SELECT id FROM users WHERE referral_code = ?").get(referralCode) as any;
      if (referrer) {
        referredBy = referrer.id;
        // Incrémenter le compteur de parrainage
        db.prepare("UPDATE users SET referral_count = referral_count + 1 WHERE id = ?").run(referredBy);
      }
    }

    db.prepare("INSERT INTO users (id, email, password, name, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?)").run(
      id,
      email,
      hashedPassword,
      name,
      userReferralCode,
      referredBy
    );

    // Si l'utilisateur a été parrainé, lui offrir 1 mois gratuit
    if (referredBy) {
      // On ne définit pas encore de plan premium — le mois gratuit
      // sera crédité lors du premier abonnement. Pour l'instant, on marque
      // qu'il a été parrainé.
    }

    const token = signToken({ userId: id, email, plan: "free" });

    return NextResponse.json({ token, user: { id, email, name, plan: "free" } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}