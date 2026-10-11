import type { Sport } from "@/config/sports";

export type MatchStatus = "scheduled" | "live" | "finished";

export type SportTeam = {
  id: string;
  name: string;
  shortName: string;
  /** Identity color, as a hex value. */
  color: string;
  /** Secondary identity color used by two-tone badges. */
  secondaryColor?: string;
  /** Contrast-safe badge label color when white is unsuitable. */
  badgeTextColor?: string;
  /** Contrast-safe supporting label color for two-tone identity surfaces. */
  secondaryTextColor?: string;
};

export type SportMatch = {
  id: string;
  sport: Sport;
  /** Short code shown on tiles, for example "EPL". */
  leagueLabel: string;
  home: SportTeam;
  away: SportTeam;
  status: MatchStatus;
  /** ISO 8601 timestamp. */
  kickoff: string;
  /** Display-ready score. Cricket innings include wickets and overs. */
  homeScore?: number | string;
  awayScore?: number | string;
  /** Optional human-readable outcome shown below a finished fixture. */
  resultLine?: string;
  /** Minutes played, when live. */
  liveMinute?: number;
  /** Oz staked across this match's markets. Unknown without the fixture. */
  volumeOz?: number;
};
