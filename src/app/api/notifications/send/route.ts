import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { processUserNotifications } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const count = await processUserNotifications(user.userId);
    return NextResponse.json({
      message: count > 0
        ? `${count} notification(s) WhatsApp envoyée(s) ✅`
        : "Aucune nouvelle offre à notifier. Assurez-vous d'avoir renseigné votre téléphone et activé WhatsApp dans votre profil.",
      sent: count,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}