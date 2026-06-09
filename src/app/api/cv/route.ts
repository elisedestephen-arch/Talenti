import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { generateCV } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier les limites pour les utilisateurs gratuits
  if (user.plan === "free") {
    const count = db
      .prepare("SELECT COUNT(*) as count FROM cvs WHERE user_id = ?")
      .get(user.userId) as any;
    if (count.count >= 1) {
      return NextResponse.json(
        { error: "Limite gratuite atteinte. Passez à Premium pour des CV illimités." },
        { status: 403 }
      );
    }
  }

  try {
    const { name, studies, experience, languages, skills, format } = await req.json();

    const content = await generateCV({
      name,
      studies,
      experience,
      languages,
      skills,
      format: format || "moderne",
    });

    const id = uuidv4();
    db.prepare(
      "INSERT INTO cvs (id, user_id, title, format, content) VALUES (?, ?, ?, ?, ?)"
    ).run(id, user.userId, `CV - ${format}`, format || "moderne", content);

    return NextResponse.json({ id, content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération du CV" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const cvs = db.prepare("SELECT id, title, format, created_at FROM cvs WHERE user_id = ? ORDER BY created_at DESC").all(user.userId);
  return NextResponse.json(cvs);
}