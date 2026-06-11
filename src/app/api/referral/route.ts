import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const dbUser = db.prepare(`
      SELECT id, name, email, referral_code, referral_count, referral_credits, free_until 
      FROM users WHERE id = ?
    `).get(user.userId) as any;

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Récupérer la liste des filleuls
    const referredUsers = db.prepare(`
      SELECT id, name, email, plan, created_at 
      FROM users 
      WHERE referred_by = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(user.userId) as any[];

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    return NextResponse.json({
      referralCode: dbUser.referral_code,
      referralLink: dbUser.referral_code ? `${baseUrl}/register?ref=${dbUser.referral_code}` : null,
      referralCount: dbUser.referral_count || 0,
      referralCredits: dbUser.referral_credits || 0,
      freeUntil: dbUser.free_until,
      referredUsers: referredUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plan: u.plan,
        joinedAt: u.created_at,
      })),
    });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json(
        { referralCode: null, referralLink: null, referralCount: 0, referralCredits: 0, freeUntil: null, referredUsers: [] },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}