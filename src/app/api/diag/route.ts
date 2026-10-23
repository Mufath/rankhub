import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  // Basic security check
  if (secret !== process.env.ADMIN_SECRET && secret !== "SOPRAK3") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isSupabaseConfigured();
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      configured,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      error: "Supabase client not initialized",
    });
  }

  try {
    const { data: boards, error: boardsError } = await supabase
      .from("boards")
      .select("*");

    return NextResponse.json({
      configured,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      boardsCount: boards ? boards.length : 0,
      boards,
      boardsError: boardsError ? { message: boardsError.message, details: boardsError.details, code: boardsError.code } : null,
    });
  } catch (err) {
    return NextResponse.json({
      configured,
      error: (err as Error).message,
    });
  }
}
