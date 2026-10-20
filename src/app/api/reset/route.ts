import { NextRequest, NextResponse } from "next/server";
import { resetDatabase } from "@/lib/storage";
import { isAdminAuthorized } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await resetDatabase();
    return NextResponse.json({
      success: true,
      message: "Database reset to initial seed data successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
