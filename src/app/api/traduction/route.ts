import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { translateDocument } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (user.plan !== "pro") {
    return NextResponse.json(
      { error: "La traduction est réservée aux abonnés Pro" },
      { status: 403 }
    );
  }

  try {
    const { content, targetLang } = await req.json();
    const translated = await translateDocument(content, targetLang);
    return NextResponse.json({ translated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la traduction" }, { status: 500 });
  }
}