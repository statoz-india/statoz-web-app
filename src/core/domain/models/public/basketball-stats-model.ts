import type { DeepNullable, StatsSide } from "@/core/domain/types/game-types";

/*
 * A basketball game's stats, as docs/stats.md describes them. A field the
 * guide names without showing its value is typed from the backend's sample
 * summary, or `unknown` where nothing reads it.
 */

type TeamScore = {
  team: string;
  abbreviation: string;
  score: number;
  /** The team's win-loss record, for example "62-20". */
  record: string;
};

type MatchDetails = {
  gameType: "basketball";
  season: number;
  location: { venue: string; city: string; state: string; country: string };
  attendance: number;
  /** The broadcaster's name. */
  broadcast: string;
  series: Array<{ title: string; description: string; summary: string }>;
  /** The score by period, as in `lineScore`. */
  periods: Period[];
  /** Each team's best in points, rebounds and assists. */
  leaders: Array<{
    team: string;
    teamId: string;
    leaders: Array<{
      category: string;
      label: string;
      id: string;
      name: string;
      value: number;
    }>;
  }>;
  league: string;
  leagueAbbreviation: string;
  /** For example "NBA Finals - Game 5". */
  gameNote: string;
  tipoff: string;
  /** The provider's status text, such as "Final". */
  status: string;
  /** True once the game is over, which is when polling should stop. */
  completed: boolean;
  overtime: boolean;
  score: {
    home: TeamScore;
    away: TeamScore;
    /** For example "90-94". */
    display: string;
    margin: number;
    /** The winning team's name. */
    winner: string;
  };
} & Record<
  // `period` and `clock` are those of a game in play; both are null after it.
  "period" | "clock" | "date" | "time" | "officials",
  unknown
>;

type Period = {
  period: number;
  /** For example "Q1". */
  label: string;
  home: number;
  away: number;
};

type LineScoreTeam = {
  team: string;
  abbreviation: string;
  total: number;
};

type LineScore = {
  periods: Period[];
  home: LineScoreTeam;
  away: LineScoreTeam;
  overtime: boolean;
};

type TopStat = {
  /** The stat's key, for example "fieldGoalPct". */
  name: string;
  label: string;
  available: boolean;
  home: number;
  away: number;
  /** The side with the larger value. */
  higher: StatsSide;
};

type TurningPoint = {
  /** The `id` of the play in `playByPlay`. */
  playId: string;
  period: number;
  clock: string;
  homeWinPercentage: number;
  awayWinPercentage: number;
  homeScore: number;
  awayScore: number;
  /** The change in the home side's win probability. Negative favours away. */
  swing: number;
  text: string;
};

type Play = {
  id: string;
  period: number;
  clock: string;
  /** For example "shot" or "free-throw". */
  kind: string;
  label: string;
  text: string;
  side: StatsSide;
  /** The players named in the play, the shooter first. */
  players: string[];
  scoringPlay: boolean;
  points: number;
  homeScore: number;
  awayScore: number;
  shootingPlay: boolean;
  made: boolean;
  /** Where a shot was taken: `x` 0 to 50 along the baseline, `y` feet from the rim. */
  coordinate: { x: number; y: number };
};

type TeamInjuries = Record<"team" | "teamId" | "injuries", unknown>;

/** A player and their box score. */
type Shooting = { made: number; attempted: number; pct: number };

type Player = {
  id: string;
  name: string;
  shortName: string;
  jersey: string;
  position: string;
  starter: boolean;
  didNotPlay: boolean;
  /** Why a player did not play, for example "COACH'S DECISION". */
  reason: string;
  ejected: boolean;
  // The figures below are missing altogether for a player who did not play.
  minutes?: number;
  points?: number;
  fieldGoals?: Shooting;
  threePointFieldGoals?: Shooting;
  freeThrows?: Shooting;
  rebounds?: number;
  assists?: number;
  turnovers?: number;
  steals?: number;
  blocks?: number;
  offensiveRebounds?: number;
  defensiveRebounds?: number;
  fouls?: number;
  plusMinus?: number;
};

type Team = {
  id: string;
  name: string;
  abbreviation: string;
  homeAway: StatsSide;
  /** The starting five, by name. */
  starters: string[];
  players: Player[];
};

export type BasketballSummary = DeepNullable<{
  matchDetails: MatchDetails;
  /** The score by period. */
  lineScore: LineScore;
  /** Head-to-head rows, such as field goal percentage. */
  topStats: TopStat[];
  /** The biggest swings in win probability. */
  turningPoints: TurningPoint[];
  /** Plays in order. */
  playByPlay: Play[];
  /** One entry per team. */
  injuries: TeamInjuries[];
  /** The two teams. */
  teams: Team[];
}>;
