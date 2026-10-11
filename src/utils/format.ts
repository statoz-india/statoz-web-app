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

/** Compact Oz volume: 48200 becomes "48.2K". */
export function formatOzCompact(value: number): string {
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

/** A probability as the API sends it, 0 to 100, with at most one decimal. */
export function formatPercent(value: number): string {
  return `${Number(value.toFixed(1))}%`;
}
