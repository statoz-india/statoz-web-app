import type { DeepNullable, StatsLocation, StatsSide } from "./shared";

/*
 * A football match's stats, as docs/stats.md describes them and as the API
 * returns them. A field typed `unknown` is one that has only ever been seen
 * empty, so its shape is not known.
 */

type TeamScore = {
  team: string;
  abbreviation: string;
  score: number;
};

type Scorer = {
  id: string;
  name: string;
  team: string;
  teamId: string;
  /** Display-ready, for example "29'". */
  minute: string;
  period: number;
  /** For example "Goal" or "Penalty - Scored". */
  type: string;
  assist: unknown;
  shootout: boolean;
};

type MatchDetails = {
  gameType: "football";
  league: string;
  season: string;
  /** The kick-off as a date, a clock time, and both together. */
  date: string;
  time: string;
  kickoff: string;
  /** The provider's status text, such as "First Half" or "Full Time". */
  status: string;
  /** True once the match is over, which is when polling should stop. */
  completed: boolean;
  location: StatsLocation;
  attendance: number;
  score: {
    home: TeamScore;
    away: TeamScore;
    /** For example "2-3". */
    display: string;
    /** The winning team's name. */
    winner: string;
  };
  scorers: Scorer[];
};

type StatValue = {
  value: number;
  /** Display-ready, for example "61.5%". */
  display: string;
  /** This side's part of the two values together, 0 to 100. */
  share: number;
};

type TopStat = {
  /** The stat's key, for example "possessionPct". */
  name: string;
  label: string;
  available: boolean;
  home: StatValue;
  away: StatValue;
  /** The side with the larger value. Null when they are level. */
  higher: StatsSide;
};

type TimelineEvent = {
  /** Display-ready, for example "29'". Empty for an event without one. */
  minute: string;
  clock: number;
  period: number;
  /** For example "kickoff", "goal" or "yellow-card". */
  kind: string;
  label: string;
  marker: boolean;
  side: StatsSide;
  team: string;
  teamId: string;
  player: string;
  assist: unknown;
  playerIn: unknown;
  playerOut: unknown;
  /** "yellow" or "red" on a booking. */
  card: string;
  /** The score once this event had happened. */
  score: {
    home: number;
    away: number;
    display: string;
  };
  text: string;
};

type TeamSide = {
  team: string;
  side: StatsSide;
};

type Momentum = {
  totalMinutes: number;
  halftimeMinute: unknown;
  home: TeamSide;
  away: TeamSide;
  /** One entry per minute played. */
  series: Array<{
    minute: number;
    home: number;
    away: number;
    value: number;
  }>;
  goals: Array<{
    minute: number;
    axis: number;
    clock: string;
    side: StatsSide;
    team: string;
    player: string;
  }>;
};

/** How the coordinates of a shot map or a territory grid are laid out. */
type PlotFrame = {
  scale: number;
  invertX: boolean;
  origin: string;
  sampled: number;
};

type Shot = {
  playId: string;
  minute: number;
  clock: string;
  period: number;
  side: StatsSide;
  team: string;
  player: string;
  /** For example "shot-on-target" or "goal". */
  kind: string;
  /** For example "on-target", "blocked" or "goal". */
  outcome: string;
  goal: boolean;
  onTarget: boolean;
  x: number;
  y: number;
  endX: number;
  endY: number;
  goalY: number;
  distance: number;
};

type ShotMap = {
  /** False when there is nothing to draw. */
  available: boolean;
  frame: PlotFrame;
  pitch: {
    length: number;
    width: number;
  };
  home: TeamSide & { shots: number; onTarget: number; goals: number };
  away: TeamSide & { shots: number; onTarget: number; goals: number };
  shots: Shot[];
};

type TerritorySide = TeamSide & {
  events: number;
  thirds: {
    defensive: number;
    middle: number;
    attacking: number;
  };
  cells: Array<{
    col: number;
    row: number;
    x: number;
    y: number;
    count: number;
    weight: number;
  }>;
};

type Territory = {
  /** False when there is nothing to draw. */
  available: boolean;
  frame: PlotFrame;
  grid: {
    columns: number;
    rows: number;
  };
  events: {
    located: number;
    plotted: number;
  };
  home: TerritorySide;
  away: TerritorySide;
};

type CommentaryEntry = {
  sequence: number;
  minute: string;
  clock: number;
  period: number;
  kind: string;
  text: string;
  team: string;
  side: StatsSide;
  /** The names of the players involved. */
  players: string[];
  playId: string;
  position: {
    x: number;
    y: number;
    endX: number;
    endY: number;
    goalY: number;
  };
};

type Player = {
  id: string;
  name: string;
  shortName: string;
  jersey: string;
  /** A short code, for example "G". */
  position: string;
  positionName: string;
  starter: boolean;
  formationPlace: string;
  source: string;
};

type Team = {
  id: string;
  name: string;
  abbreviation: string;
  homeAway: StatsSide;
  /** For example "4-2-3-1". */
  formation: string;
  lineupsConfirmed: boolean;
  source: string;
  playerCount: number;
  players: Player[];
};

export type FootballSummary = DeepNullable<{
  matchDetails: MatchDetails;
  /** Head-to-head rows, such as possession and shots. */
  topStats: TopStat[];
  /** Match events in order. */
  timeline: TimelineEvent[];
  momentum: Momentum;
  /** Added to the stats later, so an older match does not have it. */
  shotMap?: ShotMap;
  /** Added to the stats later, so an older match does not have it. */
  territory?: Territory;
  commentary: CommentaryEntry[];
  /** The two line-ups. */
  teams: Team[];
}>;
