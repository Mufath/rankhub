import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSecret } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = body.secret || body.password || body.pin;

    if (!secret || !verifyAdminSecret(secret)) {
      return NextResponse.json(
        { success: false, error: "Invalid Admin Secret / Password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
    });

    // Set HTTP cookie (expires in 7 days)
    response.cookies.set("rankhub_admin_token", secret, {
      httpOnly: false, // accessible to client for Authorization header if needed
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out",
  });

  response.cookies.delete("rankhub_admin_token");
  return response;
}
