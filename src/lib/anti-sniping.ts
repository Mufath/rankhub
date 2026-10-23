import { Board } from "@/types";

export interface AntiSnipingResult {
  triggered: boolean;
  oldDeadline?: string | null;
  newDeadline?: string | null;
  addedSeconds?: number;
  remainingSecondsBeforeBid?: number;
}

/**
 * Anti-Sniping (Soft Close) Engine:
 * If a bid arrives in the final seconds before deadline, automatically
 * extend the auction deadline to give competitors a fair window to counter.
 */
export function evaluateAntiSniping(
  board: Board
): AntiSnipingResult {
  if (board.status !== "ACTIVE" || !board.deadline) {
    return { triggered: false };
  }

  // Check if anti-sniping is enabled (default enabled)
  const isEnabled = board.config?.enableAntiSniping !== false;
  if (!isEnabled) {
    return { triggered: false };
  }

  const thresholdSec = board.config?.antiSnipingThresholdSec ?? 60; // default 60s
  const extensionSec = board.config?.antiSnipingExtensionSec ?? 120; // default 120s (+2 minutes)

  const now = Date.now();
  const deadlineMs = new Date(board.deadline).getTime();
  const remainingMs = deadlineMs - now;
  const remainingSec = Math.floor(remainingMs / 1000);

  // If already expired or outside the trigger window, don't trigger
  if (remainingSec <= 0 || remainingSec > thresholdSec) {
    return { triggered: false, remainingSecondsBeforeBid: remainingSec };
  }

  // Dynamic extension: ensure participants have at least extensionSec from now
  const newDeadlineMs = now + extensionSec * 1000;
  const newDeadlineIso = new Date(newDeadlineMs).toISOString();

  return {
    triggered: true,
    oldDeadline: board.deadline,
    newDeadline: newDeadlineIso,
    addedSeconds: extensionSec,
    remainingSecondsBeforeBid: remainingSec,
  };
}
