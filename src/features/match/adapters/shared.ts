import type { MatchDetailLineup, MatchDetailScoreboard } from "../types";

/** Helpers the per-sport adapters share. */

export type Side = "home" | "away";

/** A list as it can be trusted: never null, with no null rows. */
export function present<T>(
  items: readonly (T | null)[] | null | undefined,
): T[] {
  return (items ?? []).filter((item): item is T => item != null);
}

export function side(value: string | null | undefined): Side | undefined {
  return value === "home" || value === "away" ? value : undefined;
}

/** A figure as a report prints it: whole numbers bare, the rest to one place. */
export function shown(value: number, percentage = false): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${percentage ? "%" : ""}`;
}

export const EMPTY_LINEUP: MatchDetailLineup = {
  formation: "",
  confirmed: false,
  players: [],
  substitutes: [],
};

/** A report with nothing in it yet, for a sport to fill in what it has. */
export function emptyScoreboard(): MatchDetailScoreboard {
  return {
    stats: [],
    timeline: [],
    commentary: [],
    homeLineup: EMPTY_LINEUP,
    awayLineup: EMPTY_LINEUP,
    scoreRows: [],
    intel: { competition: "", season: "", venue: "", facts: [] },
  };
}
