import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { generateLettre } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (user.plan === "free") {
    const count = db
      .prepare("SELECT COUNT(*) as count FROM lettres WHERE user_id = ?")
      .get(user.userId) as any;
    if (count.count >= 3) {
      return NextResponse.json(
        { error: "Limite gratuite atteinte (3 lettres). Passez à Premium." },
        { status: 403 }
      );
    }
  }

  try {
    const { offre } = await req.json();
    const content = await generateLettre(offre);

    const id = uuidv4();
    db.prepare("INSERT INTO lettres (id, user_id, offre, content) VALUES (?, ?, ?, ?)").run(
      id,
      user.userId,
      offre,
      content
    );

    return NextResponse.json({ id, content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}