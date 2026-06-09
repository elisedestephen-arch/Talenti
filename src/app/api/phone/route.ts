import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/phone — Récupérer le numéro de téléphone
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const u = db.prepare("SELECT phone FROM users WHERE id = ?").get(user.userId) as any;
  return NextResponse.json({ phone: u?.phone || "" });
}

// POST /api/phone — Sauvegarder le numéro de téléphone
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { phone, whatsapp_optin } = await req.json();

    // Mettre à jour le téléphone
    db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(phone || null, user.userId);

    // Mettre à jour l'opt-in WhatsApp
    const prefs = db.prepare("SELECT id FROM user_preferences WHERE user_id = ?").get(user.userId) as any;
    if (prefs) {
      db.prepare("UPDATE user_preferences SET whatsapp_optin = ? WHERE user_id = ?").run(whatsapp_optin ? 1 : 0, user.userId);
    }

    return NextResponse.json({ message: "Numéro de téléphone sauvegardé ✅" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}