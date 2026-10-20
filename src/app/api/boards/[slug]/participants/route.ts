import { NextRequest, NextResponse } from "next/server";
import {
  getBoardBySlug,
  saveParticipant,
  deleteParticipant,
  getParticipantsByBoardId,
} from "@/lib/storage";
import { isAdminAuthorized } from "@/lib/auth";
import { Participant } from "@/types";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const board = await getBoardBySlug(slug);

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found" },
        { status: 404 }
      );
    }

    if (board.status === "LOCKED" || board.status === "ARCHIVED") {
      return NextResponse.json(
        { success: false, error: "Board is locked or archived. No changes allowed." },
        { status: 400 }
      );
    }

    const isAuth = isAdminAuthorized(request);

    // If not admin, check if public submit is allowed
    if (!isAuth && !board.config?.allowPublicSubmit) {
      return NextResponse.json(
        { success: false, error: "Public submission is disabled for this board." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.identifier || body.value === undefined) {
      return NextResponse.json(
        { success: false, error: "Name, identifier, and value are required." },
        { status: 400 }
      );
    }

    const numValue = Number(body.value);
    if (isNaN(numValue)) {
      return NextResponse.json(
        { success: false, error: "Value must be a valid number." },
        { status: 400 }
      );
    }

    // Check if participant with identifier already exists in this board
    const currentParticipants = await getParticipantsByBoardId(board.id);
    const existing = currentParticipants.find(
      (p) => p.identifier.trim().toLowerCase() === String(body.identifier).trim().toLowerCase()
    );

    const participantId = existing ? existing.id : (body.id || `part-${Date.now()}`);

    // If public submit, default to PENDING. If admin, can specify status directly.
    const status = isAuth
      ? body.status || "VERIFIED"
      : existing
      ? existing.status // keep existing status if updating
      : "PENDING";

    const participant: Participant = {
      id: participantId,
      boardId: board.id,
      name: body.name.trim(),
      identifier: String(body.identifier).trim(),
      value: numValue,
      status,
      customMeta: body.customMeta || existing?.customMeta || {},
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveParticipant(participant);

    return NextResponse.json({
      success: true,
      data: saved,
      message: existing
        ? "Participant updated successfully"
        : "Participant added successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin secret required" },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const board = await getBoardBySlug(slug);

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Participant ID is required" },
        { status: 400 }
      );
    }

    const participants = await getParticipantsByBoardId(board.id);
    const existing = participants.find((p) => p.id === body.id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Participant not found in this board" },
        { status: 404 }
      );
    }

    const updated: Participant = {
      ...existing,
      name: body.name !== undefined ? body.name.trim() : existing.name,
      identifier: body.identifier !== undefined ? body.identifier.trim() : existing.identifier,
      value: body.value !== undefined ? Number(body.value) : existing.value,
      status: body.status || existing.status,
      customMeta:
        body.customMeta !== undefined
          ? { ...existing.customMeta, ...body.customMeta }
          : existing.customMeta,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveParticipant(updated);

    return NextResponse.json({
      success: true,
      data: saved,
      message: "Participant updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin secret required" },
        { status: 401 }
      );
    }

    const { slug } = await context.params;
    const board = await getBoardBySlug(slug);

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("id");

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: "Participant ID parameter is required" },
        { status: 400 }
      );
    }

    await deleteParticipant(participantId);

    return NextResponse.json({
      success: true,
      message: "Participant deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
