import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    // Quick DB connectivity check
    const { error } = await supabase.from("organizations").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "degraded", db: "error", error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: "healthy", db: "connected", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: e instanceof Error ? e.message : "Unknown" },
      { status: 503 }
    );
  }
}
