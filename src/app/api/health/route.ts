import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Railway healthcheck — just confirm the server is running.
  // Always return 200 so deployments don't fail due to transient
  // Supabase / network delays during container startup.
  return NextResponse.json(
    { status: "healthy", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
