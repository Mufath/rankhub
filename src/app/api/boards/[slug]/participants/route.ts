import { NextRequest, NextResponse } from "next/server";
import {
  getBoardBySlug,
  saveBoard,
  saveParticipant,
  deleteParticipant,
  getParticipantsByBoardId,
} from "@/lib/storage";
import { isAdminAuthorized } from "@/lib/auth";
import { sortAndRankParticipants, formatScore } from "@/lib/utils";
import { evaluateAntiSniping } from "@/lib/anti-sniping";
import { realtimeHub } from "@/lib/realtime-hub";
import { dispatchWebhook } from "@/lib/webhooks";
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

    // Check existing participants & track previous rank 1 leader
    const currentParticipants = await getParticipantsByBoardId(board.id);
    const prevRanked = sortAndRankParticipants(currentParticipants, board.sortOrder);
    const prevLeader = prevRanked[0]?.name;

    const existing = currentParticipants.find(
      (p) => p.identifier.trim().toLowerCase() === String(body.identifier).trim().toLowerCase()
    );

    const participantId = existing ? existing.id : (body.id || `part-${Date.now()}`);

    // If public submit, default to PENDING (or VERIFIED if auto-verified)
    const status = isAuth
      ? body.status || "VERIFIED"
      : existing
      ? existing.status
      : "VERIFIED"; // In live lelang, submissions are displayed verified unless flagged

    // --- Point 5: Anti-Sniping (Soft Close) Check ---
    let antiSnipingInfo = { triggered: false };
    const antiSniping = evaluateAntiSniping(board);
    if (antiSniping.triggered && antiSniping.newDeadline) {
      antiSnipingInfo = antiSniping;
      board.deadline = antiSniping.newDeadline;
      await saveBoard(board);

      realtimeHub.broadcast(slug, "DEADLINE_EXTENDED", {
        newDeadline: antiSniping.newDeadline,
        addedSeconds: antiSniping.addedSeconds,
        triggeredBy: body.name.trim(),
        message: `⚡ Anti-Sniping Aktif: Waktu lelang diperpanjang +${antiSniping.addedSeconds} detik!`,
      });

      dispatchWebhook(
        {
          event: "board.deadline_extended",
          boardSlug: board.slug,
          boardTitle: board.title,
          timestamp: new Date().toISOString(),
          data: {
            newDeadline: antiSniping.newDeadline,
            addedSeconds: antiSniping.addedSeconds,
            triggeredBy: body.name.trim(),
          },
        },
        board.config?.webhookUrl
      ).catch(() => {});
    }

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

    const saved = await saveParticipant(participant, { previousValue: existing?.value });

    // Re-fetch and rank participants for Point 2: Realtime Live Re-ranking
    const updatedParticipants = await getParticipantsByBoardId(board.id);
    const updatedRanked = sortAndRankParticipants(updatedParticipants, board.sortOrder);
    const currentRank = updatedRanked.findIndex((p) => p.id === saved.id) + 1;
    saved.rank = currentRank;

    // Check if new leader took rank #1
    const newLeader = updatedRanked[0]?.name;
    if (newLeader && prevLeader && newLeader !== prevLeader && saved.name === newLeader) {
      realtimeHub.broadcast(slug, "OUTBID_ALERT", {
        newLeader: saved.name,
        previousLeader: prevLeader,
        rank: 1,
        value: saved.value,
        formattedValue: formatScore(saved.value, board.unitType, board.customUnit),
        message: `🔥 ${saved.name} merebut Peringkat #1 dari ${prevLeader}!`,
      });

      dispatchWebhook(
        {
          event: "rank.outbid",
          boardSlug: board.slug,
          boardTitle: board.title,
          timestamp: new Date().toISOString(),
          data: {
            newLeader: saved.name,
            previousLeader: prevLeader,
            value: saved.value,
            formattedValue: formatScore(saved.value, board.unitType, board.customUnit),
          },
        },
        board.config?.webhookUrl
      ).catch(() => {});
    }

    // Broadcast updated participant array to all live clients
    realtimeHub.broadcast(slug, "PARTICIPANTS_UPDATED", {
      participants: updatedRanked,
      board,
      timestamp: new Date().toISOString(),
    });

    // Dispatch webhook for bid creation
    dispatchWebhook(
      {
        event: "bid.created",
        boardSlug: board.slug,
        boardTitle: board.title,
        timestamp: new Date().toISOString(),
        data: {
          id: saved.id,
          name: saved.name,
          value: saved.value,
          rank: currentRank,
          status: saved.status,
          formattedValue: formatScore(saved.value, board.unitType, board.customUnit),
        },
      },
      board.config?.webhookUrl
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      data: saved,
      antiSniping: antiSnipingInfo,
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

    const saved = await saveParticipant(updated, { previousValue: existing.value });

    // Re-rank & broadcast update
    const updatedParticipants = await getParticipantsByBoardId(board.id);
    const updatedRanked = sortAndRankParticipants(updatedParticipants, board.sortOrder);

    realtimeHub.broadcast(slug, "PARTICIPANTS_UPDATED", {
      participants: updatedRanked,
      board,
      timestamp: new Date().toISOString(),
    });

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

    // Re-rank & broadcast update
    const updatedParticipants = await getParticipantsByBoardId(board.id);
    const updatedRanked = sortAndRankParticipants(updatedParticipants, board.sortOrder);

    realtimeHub.broadcast(slug, "PARTICIPANTS_UPDATED", {
      participants: updatedRanked,
      board,
      timestamp: new Date().toISOString(),
    });

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
