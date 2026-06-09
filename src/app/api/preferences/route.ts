import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { matchUserJobs } from "@/lib/jobs";

// GET /api/preferences — Récupérer les préférences
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const prefs = db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(user.userId);
  return NextResponse.json({ preferences: prefs || null });
}

// POST /api/preferences — Sauvegarder les préférences
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { skills, sectors, target_countries, min_salary, experience_level, languages, availability } = await req.json();

    const existing = db.prepare("SELECT id FROM user_preferences WHERE user_id = ?").get(user.userId) as any;

    if (existing) {
      db.prepare(
        `UPDATE user_preferences SET
          skills = ?, sectors = ?, target_countries = ?, min_salary = ?,
          experience_level = ?, languages = ?, availability = ?
         WHERE user_id = ?`
      ).run(skills || null, sectors || null, target_countries || null, min_salary || null,
        experience_level || null, languages || null, availability || null, user.userId);
    } else {
      const id = uuidv4();
      db.prepare(
        `INSERT INTO user_preferences (id, user_id, skills, sectors, target_countries, min_salary, experience_level, languages, availability)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, user.userId, skills || null, sectors || null, target_countries || null,
        min_salary || null, experience_level || null, languages || null, availability || null);
    }

    // Déclencher le matching après avoir sauvegardé les préférences
    matchUserJobs(user.userId, 15);

    return NextResponse.json({ message: "Préférences sauvegardées" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}