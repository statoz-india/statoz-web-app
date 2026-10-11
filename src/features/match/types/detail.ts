import type { F1RaceReport } from "./race";
import type {
  BasketballScoringEvent,
  BoxScore,
  FeedEvent,
  InningsLine,
  MatchIntel,
  MatchPlayerDossier,
  MatchShot,
  MatchTrace,
  RunRatePoint,
  StatLeader,
} from "./report";

export type MatchDetailStat = {
  label: string;
  home: string;
  away: string;
  homeValue: number;
  awayValue: number;
};

export type MatchDetailTimelineEvent = {
  minute: string;
  side?: "home" | "away";
  type: "goal" | "yellow" | "red" | "substitution" | "score";
  player: string;
  secondary?: string;
  marker?: boolean;
  label?: string;
  scoreDisplay?: string;
  description?: string;
};

export type MatchDetailCommentary = {
  minute: string;
  text: string;
  sequence?: number;
  kind?: string;
  side?: "home" | "away";
  teamName?: string;
  players?: string[];
};

export type MatchDetailPlayer = {
  name: string;
  shortName?: string;
  number: number;
  role: string;
  captain?: boolean;
  formationPlace?: number;
};

export type MatchDetailLineup = {
  formation: string;
  players: MatchDetailPlayer[];
  /** The bench, in the order a manager would use it. */
  substitutes: MatchDetailPlayer[];
  /** A team sheet the competition has confirmed, rather than a projection. */
  confirmed: boolean;
};

/** What the STATS tab reads. */
export type MatchDetailScoreboard = {
  stats: MatchDetailStat[];
  timeline: MatchDetailTimelineEvent[];
  commentary: MatchDetailCommentary[];
  homeLineup: MatchDetailLineup;
  awayLineup: MatchDetailLineup;
  /** Quarters in basketball, innings in cricket. Empty elsewhere. */
  scoreRows: Array<{ label: string; home: string; away: string }>;
  intel: MatchIntel;
  /** Football momentum, a basketball score race, a cricket run race. */
  trace?: MatchTrace;
  shots?: MatchShot[];
  players?: MatchPlayerDossier[];
  leaders?: StatLeader[];
  boxScore?: BoxScore;
  innings?: InningsLine[];
  feed?: FeedEvent[];
  runRate?: Array<{
    innings: 1 | 2;
    teamId: string;
    points: RunRatePoint[];
  }>;
  basketballShots?: BasketballScoringEvent[];
  race?: F1RaceReport;
};
