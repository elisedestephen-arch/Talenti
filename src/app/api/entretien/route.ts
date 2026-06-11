import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { simulateEntretien } from "@/lib/openai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { poste, historique } = await req.json();

    const result = await simulateEntretien(poste, historique || []);

    const id = uuidv4();
    db.prepare(
      "INSERT INTO entretiens (id, user_id, poste, historique) VALUES (?, ?, ?, ?)"
    ).run(id, user.userId, poste, JSON.stringify([...(historique || []), result.question]));

    return NextResponse.json({ id, ...result });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la simulation" }, { status: 500 });
  }
}