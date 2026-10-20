import { NextRequest, NextResponse } from "next/server";
import {
  getBoardBySlug,
  getParticipantsByBoardId,
  saveBoard,
  deleteBoard,
} from "@/lib/storage";
import { isAdminAuthorized } from "@/lib/auth";
import { sortAndRankParticipants } from "@/lib/utils";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const board = await getBoardBySlug(slug);

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found" },
        { status: 404 }
      );
    }

    const isAuth = isAdminAuthorized(request);
    if (board.visibility === "UNLISTED" && !isAuth) {
      // Unlisted boards can be accessed if accessed by exact slug link, which is what we do here
    }

    const rawParticipants = await getParticipantsByBoardId(board.id);
    const rankedParticipants = sortAndRankParticipants(rawParticipants, board.sortOrder);

    const stats = {
      totalParticipants: rankedParticipants.length,
      verifiedParticipants: rankedParticipants.filter((p) => p.status === "VERIFIED").length,
      pendingParticipants: rankedParticipants.filter((p) => p.status === "PENDING").length,
      topValue: rankedParticipants.length > 0 ? rankedParticipants[0].value : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...board,
        participants: rankedParticipants,
        stats,
      },
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

    const updatedBoard = {
      ...board,
      ...body,
      id: board.id, // Immutable ID
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveBoard(updatedBoard);

    return NextResponse.json({
      success: true,
      data: saved,
      message: "Board updated successfully",
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

    await deleteBoard(board.id);

    return NextResponse.json({
      success: true,
      message: `Board '${board.title}' deleted successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
