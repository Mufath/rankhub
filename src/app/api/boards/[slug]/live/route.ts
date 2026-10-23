import { NextRequest } from "next/server";
import { getBoardBySlug, getParticipantsByBoardId } from "@/lib/storage";
import { sortAndRankParticipants } from "@/lib/utils";
import { realtimeHub } from "@/lib/realtime-hub";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    return new Response(JSON.stringify({ error: "Board not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  let subscriberId: string | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      subscriberId = realtimeHub.subscribe(slug, controller);

      // Send initial state immediately
      try {
        const rawParticipants = await getParticipantsByBoardId(board.id);
        const ranked = sortAndRankParticipants(rawParticipants, board.sortOrder);
        const encoder = new TextEncoder();
        const initData = JSON.stringify({
          board,
          participants: ranked,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`event: INIT\ndata: ${initData}\n\n`));
      } catch (err) {
        console.error("Error sending initial live state:", err);
      }

      // Ping every 15s to keep connection open across reverse proxies
      keepAliveInterval = setInterval(() => {
        try {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              `event: PING\ndata: {"time":${Date.now()}}\n\n`
            )
          );
        } catch {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
        }
      }, 15000);
    },
    cancel() {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }
      if (subscriberId) {
        realtimeHub.unsubscribe(slug, subscriberId);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
