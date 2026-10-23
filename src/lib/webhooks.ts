import crypto from "crypto";
import { WebhookPayload } from "@/types";

export function signPayload(payloadString: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
}

export async function dispatchWebhook(
  payload: WebhookPayload,
  targetUrl?: string,
  secretKey?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const url = targetUrl || process.env.RANKHUB_WEBHOOK_URL;
  if (!url) {
    return { success: false, error: "No webhook URL configured" };
  }

  const secret = secretKey || process.env.RANKHUB_WEBHOOK_SECRET || "rankhub-default-secret";
  const jsonBody = JSON.stringify(payload);
  const signature = signPayload(jsonBody, secret);

  try {
    // If it's a Discord webhook, format with Discord embed for a gorgeous chat card
    if (url.includes("discord.com/api/webhooks")) {
      const discordEmbed = buildDiscordEmbed(payload);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordEmbed),
      });
      return { success: res.ok, url };
    }

    // Standard HTTP Webhook for external bot workers / Cloudflare Workers
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RankHub-Event": payload.event,
        "X-RankHub-Signature": `sha256=${signature}`,
        "X-RankHub-Timestamp": payload.timestamp,
        "User-Agent": "RankHub-Webhook-Dispatcher/1.0",
      },
      body: jsonBody,
    });

    return { success: res.ok, url };
  } catch (err) {
    console.error(`[RankHub Webhook Error] Failed to deliver to ${url}:`, err);
    return { success: false, url, error: (err as Error).message };
  }
}

// Helper to construct Discord Webhook Embed
function buildDiscordEmbed(payload: WebhookPayload) {
  let title = `🏆 RankHub Event: ${payload.event}`;
  let description = `Papan Peringkat: **${payload.boardTitle}** (\`${payload.boardSlug}\`)`;
  let color = 0xe8890c; // Amber/Gold color

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [];

  if (payload.event === "bid.created") {
    title = `💰 Penawaran Baru: ${payload.data.name}`;
    fields.push({
      name: "Peserta",
      value: String(payload.data.name || "Anon"),
      inline: true,
    });
    fields.push({
      name: "Nominal / Skor",
      value: String(payload.data.formattedValue || payload.data.value),
      inline: true,
    });
    fields.push({
      name: "Peringkat",
      value: `#${payload.data.rank || "N/A"}`,
      inline: true,
    });
  } else if (payload.event === "rank.outbid") {
    title = `🔥 Perebutan Peringkat #1: ${payload.data.newLeader}`;
    color = 0xef4444; // Red/orange alert
    description = `**${payload.data.newLeader}** baru saja melampaui **${payload.data.previousLeader || "pemimpin sebelumnya"}**!`;
    fields.push({
      name: "Nilai Penawaran Baru",
      value: String(payload.data.formattedValue || payload.data.value),
      inline: true,
    });
  } else if (payload.event === "board.deadline_extended") {
    title = `⚡ Anti-Sniping Triggered!`;
    color = 0xf59e0b;
    description = `Penawaran di menit terakhir memicu perpanjangan waktu otomatis.`;
    fields.push({
      name: "Perpanjangan",
      value: `+${payload.data.addedSeconds} detik`,
      inline: true,
    });
    fields.push({
      name: "Deadline Baru",
      value: String(payload.data.newDeadline),
      inline: false,
    });
  }

  return {
    username: "RankHub Live Bot",
    avatar_url: "https://rankhub.dev/icon.svg",
    embeds: [
      {
        title,
        description,
        color,
        fields,
        footer: {
          text: `RankHub Engine • ${new Date(payload.timestamp).toLocaleTimeString()}`,
        },
        timestamp: payload.timestamp,
      },
    ],
  };
}
