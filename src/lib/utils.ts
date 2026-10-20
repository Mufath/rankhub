import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BoardSortOrder, BoardUnitType, Participant } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(
  value: number,
  unitType: BoardUnitType,
  customUnit?: string
): string {
  if (value === undefined || value === null || isNaN(value)) return "0";

  switch (unitType) {
    case "CURRENCY_IDR":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value);

    case "MILLISECONDS":
      return `${new Intl.NumberFormat("id-ID").format(value)} ms`;

    case "SCORE":
      return new Intl.NumberFormat("id-ID").format(value);

    case "CUSTOM":
      return `${new Intl.NumberFormat("id-ID").format(value)} ${customUnit || ""}`.trim();

    default:
      return value.toString();
  }
}

export function maskIdentifier(identifier: string, shouldMask: boolean = true): string {
  if (!shouldMask || !identifier) return identifier;
  const str = identifier.trim();
  const len = str.length;

  if (len <= 4) {
    return str[0] + "***" + (str[len - 1] || "");
  }

  // If email
  if (str.includes("@")) {
    const [user, domain] = str.split("@");
    const maskedUser =
      user.length > 2
        ? user.slice(0, 2) + "*".repeat(Math.max(2, user.length - 2))
        : user + "***";
    return `${maskedUser}@${domain}`;
  }

  // If number/NIM (e.g. 21120120140088)
  const prefixLen = Math.min(3, Math.floor(len / 3));
  const suffixLen = Math.min(3, Math.floor(len / 3));
  const maskCount = Math.max(3, len - prefixLen - suffixLen);
  return `${str.substring(0, prefixLen)}${"*".repeat(maskCount)}${str.substring(len - suffixLen)}`;
}

export function sortAndRankParticipants(
  participants: Participant[],
  sortOrder: BoardSortOrder
): Participant[] {
  // Sort participants by value
  const sorted = [...participants].sort((a, b) => {
    // Verified usually takes priority or equal, but value determines rank
    if (sortOrder === "DESC") {
      return b.value - a.value;
    } else {
      return a.value - b.value;
    }
  });

  // Assign rank numbers (1, 2, 3...)
  return sorted.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));
}

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function getTimeRemaining(deadlineDate: string | Date): TimeRemaining {
  const total = new Date(deadlineDate).getTime() - Date.now();
  if (total <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    totalMs: total,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
