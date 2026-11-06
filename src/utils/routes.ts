export type PickType = "prediction" | "event" | "future";

export const isPickType = (value: string): value is PickType =>
  value === "prediction" || value === "event" || value === "future";

/**
 * A match or race page. `sport` is the API's gameType; it tells the page
 * whether to load a race or a team match.
 */
export function matchHref(matchId: string, sport?: string | null): string {
  const path = `/match/${encodeURIComponent(matchId)}`;
  return sport ? `${path}?sport=${encodeURIComponent(sport.toLowerCase())}` : path;
}

/*
 * Pages are addressed by an item's readable code (`IPL26-M12-P1`), never by
 * its database `_id`.
 */

/**
 * A pick's detail screen, by its `predictionId`, `eventId` or `futureId`;
 * `outcome` opens it with that side, option or choice selected.
 */
export function pickHref(type: PickType, code: string, outcome?: string): string {
  const path = `/picks/${type}/${encodeURIComponent(code)}`;
  return outcome ? `${path}?outcome=${encodeURIComponent(outcome)}` : path;
}

/** A match quiz, by its `quizId`, such as `EPL-M65-Q27`. */
export const quizHref = (quizId: string) => `/quiz/${encodeURIComponent(quizId)}`;

/** A match quiz's results: the crowd's picks and the real answers. */
export const quizResultsHref = (quizId: string) => `${quizHref(quizId)}/results`;

/** A URL segment as it was written, whether or not the router has decoded it. */
export function readableSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
