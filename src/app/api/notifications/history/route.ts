import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const notifications = getUserNotifications(user.userId);
    return NextResponse.json({ notifications });
  } catch (error: any) {
    if (error?.code === "SQLITE_BUSY") {
      return NextResponse.json({ notifications: [] }, { status: 503 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}