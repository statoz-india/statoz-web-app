/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/**
 * The state of a football, cricket or basketball match. Lower case, and
 * `canceled` has one L here; every other entity spells it with two.
 *
 * `upcoming`, `live` and `result` are set automatically from the start time
 * and the live feed. The rest are set by an admin.
 */
export type MatchStatus =
  | "upcoming"
  | "live"
  | "result"
  | "canceled"
  | "no_result"
  | "postponed"
  | "unresolved"
  | "abandoned"
  | "suspended";

/** The state of a race. Capitalised, unlike a team match's. */
export type RaceStatus = "Upcoming" | "Ongoing" | "Finished" | "Cancelled";
