export type BoardSortOrder = 'DESC' | 'ASC';

export type BoardUnitType = 'CURRENCY_IDR' | 'SCORE' | 'MILLISECONDS' | 'CUSTOM';

export type BoardStatus = 'ACTIVE' | 'LOCKED' | 'ARCHIVED';

export type BoardVisibility = 'PUBLIC' | 'UNLISTED';

export type ParticipantStatus = 'PENDING' | 'VERIFIED' | 'DISQUALIFIED';

export interface BoardConfig {
  allowPublicSubmit?: boolean;
  maskIdentifiersByDefault?: boolean;
  enablePodium?: boolean;
  maxEntries?: number;
  currencyPrefix?: string;
  enableAntiSniping?: boolean; // Point 5: Dynamic soft-close
  antiSnipingThresholdSec?: number; // e.g. 60 seconds
  antiSnipingExtensionSec?: number; // e.g. 120 seconds
  webhookUrl?: string; // Point 5: External bot / Discord webhook URL
  webhookSecret?: string;
  [key: string]: unknown;
}

export interface Board {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerNotes?: string;
  sortOrder: BoardSortOrder; // DESC: Highest first (Rp, Score), ASC: Lowest first (ms, time)
  unitType: BoardUnitType;
  customUnit?: string;
  status: BoardStatus;
  deadline?: string | null; // ISO 8601 string
  visibility: BoardVisibility;
  config?: BoardConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  boardId: string;
  name: string; // Public display alias (e.g. "Budi", "Mhs_082***")
  identifier: string; // Private unique identifier (e.g. NIM, Email, Telegram ID)
  value: number; // Value: bid amount (Rp), score, or latency (ms)
  rank?: number; // Calculated rank (1, 2, 3...)
  status: ParticipantStatus; // PENDING, VERIFIED, DISQUALIFIED
  customMeta?: Record<string, unknown>; // JSON metadata (e.g. delayOffsetMs, telegramUsername, notes)
  createdAt: string;
  updatedAt: string;
}

export interface BoardWithParticipants extends Board {
  participants: Participant[];
  stats?: {
    totalParticipants: number;
    verifiedParticipants: number;
    pendingParticipants: number;
    topValue?: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type WebhookEventType =
  | 'bid.created'
  | 'rank.outbid'
  | 'rank.reordered'
  | 'board.deadline_extended'
  | 'board.status_changed';

export interface WebhookPayload {
  event: WebhookEventType;
  boardSlug: string;
  boardTitle: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface RealtimeOutbidPayload {
  newLeader: string;
  previousLeader?: string;
  rank: number;
  value: number;
  formattedValue: string;
  message: string;
}

export interface RealtimeDeadlinePayload {
  newDeadline: string;
  addedSeconds: number;
  triggeredBy: string;
  message: string;
}

