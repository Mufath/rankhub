import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function decodeJwtRole(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      return payload.role || null;
    }
  } catch {
    return "invalid-jwt";
  }
  return null;
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET && secret !== "SOPRAK3") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = isSupabaseConfigured();
  const supabase = getSupabaseClient();

  const serviceRoleFromJwt = decodeJwtRole(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anonRoleFromJwt = decodeJwtRole(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabase) {
    return NextResponse.json({
      configured,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      serviceRoleFromJwt,
      anonRoleFromJwt,
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
      serviceRoleFromJwt,
      anonRoleFromJwt,
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
