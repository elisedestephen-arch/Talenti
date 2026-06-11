import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { matchUserJobs, getUserJobs, getRecentJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

// GET /api/jobs/mine — Récupérer les offres recommandées pour l'utilisateur
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    // D'abord essayer de matcher avec les préférences
    let jobs = getUserJobs(user.userId, 15);

    // Si pas de matching encore, faire le match maintenant
    if (jobs.length === 0) {
      jobs = matchUserJobs(user.userId, 15);
    }

    // Si toujours rien, donner les offres récentes
    if (jobs.length === 0) {
      jobs = getRecentJobs(15);
    }

    return NextResponse.json({ jobs });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json({ jobs: [] }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}