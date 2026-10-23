import { NextRequest, NextResponse } from "next/server";
import { getAllBoards, getPublicBoards, saveBoard, getBoardBySlug } from "@/lib/storage";
import { isAdminAuthorized } from "@/lib/auth";
import { Board } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const isAuth = isAdminAuthorized(request);
    const boards = isAuth ? await getAllBoards() : await getPublicBoards();

    return NextResponse.json({
      success: true,
      data: boards,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin secret required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Clean slug
    let slug = body.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-");

    // Ensure slug uniqueness across boards
    const existingBoard = await getBoardBySlug(slug);
    if (existingBoard) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newBoard: Board = {
      id: body.id || `board-${Date.now()}`,
      slug,
      title: body.title.trim(),
      description: body.description || "",
      bannerNotes: body.bannerNotes || "",
      sortOrder: body.sortOrder === "ASC" ? "ASC" : "DESC",
      unitType: body.unitType || "CURRENCY_IDR",
      customUnit: body.customUnit || "",
      status: body.status || "ACTIVE",
      deadline: body.deadline || null,
      visibility: body.visibility || "PUBLIC",
      config: {
        enablePodium: body.config?.enablePodium ?? true,
        maskIdentifiersByDefault: body.config?.maskIdentifiersByDefault ?? true,
        allowPublicSubmit: body.config?.allowPublicSubmit ?? false,
        enableAntiSniping: body.config?.enableAntiSniping ?? true,
        antiSnipingThresholdSec: body.config?.antiSnipingThresholdSec ?? 60,
        antiSnipingExtensionSec: body.config?.antiSnipingExtensionSec ?? 120,
        webhookUrl: body.config?.webhookUrl || undefined,
        webhookSecret: body.config?.webhookSecret || undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveBoard(newBoard);

    return NextResponse.json({
      success: true,
      data: saved,
      message: "Board created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
