import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { assessPassport } from "@/lib/openai";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const passport = db.prepare("SELECT * FROM passports WHERE user_id = ?").get(user.userId);
  return NextResponse.json({ passport: passport || null });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { skills, french_level, english_level } = await req.json();
    const result = await assessPassport(skills || "", french_level || "intermédiaire", english_level || "débutant");

    const existing = db.prepare("SELECT id FROM passports WHERE user_id = ?").get(user.userId) as any;

    if (existing) {
      db.prepare("UPDATE passports SET french_level=?, english_level=?, skills_verified=?, overall_score=?, certified=1, certified_at=datetime('now') WHERE user_id=?")
        .run(result.french_level, result.english_level, result.skills_verified, result.overall_score, user.userId);
    } else {
      db.prepare("INSERT INTO passports (id, user_id, french_level, english_level, skills_verified, overall_score, certified, certified_at) VALUES (?,?,?,?,?,?,1,datetime('now'))")
        .run(uuidv4(), user.userId, result.french_level, result.english_level, result.skills_verified, result.overall_score);
    }

    db.prepare("UPDATE user_preferences SET skills=? WHERE user_id=?").run(skills || "", user.userId);

    return NextResponse.json({
      message: "✅ Talenti Passport créé !",
      passport: {
        french_level: result.french_level,
        english_level: result.english_level,
        skills_verified: result.skills_verified,
        overall_score: result.overall_score,
        feedback: result.feedback,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de l'évaluation" }, { status: 500 });
  }
}