/**
 * Everything here formats in one fixed time zone rather than the viewer's, so
 * the server and the browser always produce the same text. India time is the
 * zone the API defines a match day in.
 */
const MATCH_TIME_ZONE = "Asia/Kolkata";

/** Thousands-separated integer, for coins, streaks, and counters. */
export function formatInt(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/** Below this, Oz amounts are written in full. */
const COMPACT_FROM = 10_000;

/** Oz amounts: 9999 stays "9,999"; 48200 becomes "48.2K" and 1.2M "1.2M". */
export function formatOzCompact(value: number): string {
  if (Math.abs(value) < COMPACT_FROM) return formatInt(value);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .toUpperCase();
}

/** Kick-off clock in 24-hour form, in India time. */
export function formatKickoffTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: MATCH_TIME_ZONE,
  }).format(new Date(iso));
}

/** Short kick-off date in India time, for example "26 AUG". */
export function formatKickoffDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: MATCH_TIME_ZONE,
  })
    .format(new Date(iso))
    .toUpperCase();
}

/** Full kick-off date in India time, for example "SUN 12 JUL 2026". */
export function formatMatchDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: MATCH_TIME_ZONE,
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")} ${part("day")} ${part("month")} ${part("year")}`.toUpperCase();
}

/** A probability as the API sends it, 0 to 100, with at most one decimal. */
export function formatPercent(value: number): string {
  return `${Number(value.toFixed(1))}%`;
}

/** An API status as shown: "no_result" becomes "NO RESULT". */
export function formatStatus(status: string): string {
  return status.replace(/[_-]+/g, " ").trim().toUpperCase();
}
