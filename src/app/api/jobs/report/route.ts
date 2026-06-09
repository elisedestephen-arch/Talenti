import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { job_id, reason } = await req.json();
    if (!job_id || !reason) return NextResponse.json({ error: "job_id et reason requis" }, { status: 400 });

    const job = db.prepare("SELECT id FROM job_offers WHERE id = ?").get(job_id);
    if (!job) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

    db.prepare("INSERT INTO reports (id, user_id, job_id, reason) VALUES (?, ?, ?, ?)").run(uuidv4(), user.userId, job_id, reason);

    const count = db.prepare("SELECT COUNT(*) as c FROM reports WHERE job_id = ?").get(job_id) as any;
    if (count.c >= 3) db.prepare("UPDATE job_offers SET verified = 0, fraud_score = 100 WHERE id = ?").run(job_id);

    return NextResponse.json({ message: "Signalement enregistré. Merci !" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}