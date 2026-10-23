import { NextRequest, NextResponse } from "next/server";
import { getBoardBySlug, getParticipantsByBoardId } from "@/lib/storage";
import { isAdminAuthorized } from "@/lib/auth";
import { maskIdentifier, sortAndRankParticipants } from "@/lib/utils";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// Enable CORS for external bot workers (e.g., Cloudflare Workers)
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-admin-secret",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const board = await getBoardBySlug(slug);

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = (searchParams.get("status") || "VERIFIED").toUpperCase();
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null;
    const format = searchParams.get("format") || "standard"; // 'standard' | 'queue'
    const isAuth = isAdminAuthorized(request);

    // Fetch and rank participants
    const rawParticipants = await getParticipantsByBoardId(board.id);
    let ranked = sortAndRankParticipants(rawParticipants, board.sortOrder);

    // Apply status filter: if status is not 'ALL', filter
    if (statusFilter !== "ALL") {
      const targetStatus = statusFilter === "PAID" ? "VERIFIED" : statusFilter;
      ranked = ranked.filter((p) => p.status === targetStatus);
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      ranked = ranked.slice(0, limit);
    }

    // Anti-sniping / Deadline calculation
    const remainingSeconds = board.deadline
      ? Math.max(0, Math.floor((new Date(board.deadline).getTime() - Date.now()) / 1000))
      : null;

    // If format is 'queue' (SubSecond Bot Queue Optimization):
    if (format === "queue") {
      const queueList = ranked.map((p, idx) => ({
        priorityIndex: idx + 1,
        identifier: isAuth ? p.identifier : maskIdentifier(p.identifier, true),
        alias: p.name,
        bidValue: p.value,
        status: p.status,
        delayOffsetMs: (p.customMeta as { delayOffsetMs?: number })?.delayOffsetMs ?? idx * 10,
        meta: isAuth ? p.customMeta : undefined,
      }));

      return NextResponse.json(
        {
          success: true,
          board: {
            slug: board.slug,
            title: board.title,
            status: board.status,
            sortOrder: board.sortOrder,
            unitType: board.unitType,
            deadline: board.deadline,
            deadlineSecondsRemaining: remainingSeconds,
            antiSniping: {
              enabled: board.config?.enableAntiSniping !== false,
              thresholdSeconds: board.config?.antiSnipingThresholdSec ?? 60,
              extensionSeconds: board.config?.antiSnipingExtensionSec ?? 120,
            },
          },
          count: queueList.length,
          queue: queueList,
          timestamp: new Date().toISOString(),
        },
        { headers: corsHeaders() }
      );
    }

    // Standard format
    const output = ranked.map((p) => ({
      id: p.id,
      rank: p.rank,
      name: p.name,
      identifier: isAuth ? p.identifier : maskIdentifier(p.identifier, true),
      value: p.value,
      status: p.status,
      customMeta: isAuth ? p.customMeta : undefined,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        board: {
          id: board.id,
          slug: board.slug,
          title: board.title,
          status: board.status,
          sortOrder: board.sortOrder,
          unitType: board.unitType,
          deadline: board.deadline,
        },
        total: output.length,
        filter: statusFilter,
        ranks: output,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
