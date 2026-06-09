import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { collectJobs } from "@/lib/jobs";

// POST /api/jobs/collect — Déclencher la collecte manuelle (réservé admin)
export async function POST(req: Request) {
  const user = getUserFromRequest(req as any);
  // Seul un admin ou un utilisateur authentifié peut déclencher
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const count = await collectJobs();
    return NextResponse.json({ message: `${count} nouvelles offres collectées` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la collecte" }, { status: 500 });
  }
}