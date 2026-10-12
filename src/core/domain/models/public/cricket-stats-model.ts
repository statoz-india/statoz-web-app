import type {
  DeepNullable,
  StatsLocation,
  StatsSide,
} from "@/core/domain/types/game-types";

/*
 * A cricket match's stats, as docs/stats.md describes them. A field the guide
 * names without showing its value is typed from the backend's sample summary,
 * or `unknown` where nothing reads it.
 */

type TeamScore = {
  team: string;
  abbreviation: string;
  teamId: string;
  /** Display-ready, for example "161/5 (18/20 ov, target 156)". */
  score: string;
  runs: number;
  wickets: number;
  overs: number;
  /** The numbers of the innings this team batted in. */
  innings: number[];
};

type MatchDetails = {
  gameType: "cricket";
  season: number;
  /** One row per innings, the same rows as the summary's own `innings`. */
  innings: Innings[];
  playerOfTheMatch: { id: string; name: string; team: string };
  attendance: number;
  league: string;
  leagueAbbreviation: string;
  stage: string;
  /** For example "T20". */
  format: string;
  start: string;
  /** The provider's status text, such as "Result". */
  status: string;
  state: string;
  /** True once the match is over, which is when polling should stop. */
  completed: boolean;
  /** For example "RCB won by 5 wkts (12b rem)". */
  result: string;
  location: StatsLocation;
  toss: {
    team: string;
    /** What the toss winner chose, for example "bowl". */
    decision: string;
  };
  score: {
    home: TeamScore;
    away: TeamScore;
    display: string;
    /** The winning team's name, and its id. */
    winner: string;
    winnerId: string;
  };
} & Record<"title" | "date" | "time" | "end" | "seriesNote" | "officials", unknown>;

type TeamStat = {
  /** The stat's key, for example "runs". */
  name: string;
  label: string;
  available: boolean;
  home: number;
  away: number;
  /** The side with the larger value. */
  higher: StatsSide;
};

type Innings = {
  /** The innings' number, from 1. */
  innings: number;
  team: string;
  teamId: string;
  abbreviation: string;
  runs: number;
  wickets: number;
  overs: number;
  fours: number;
  sixes: number;
  /** Set on a chase. */
  target: number;
  /** For example "155/8". */
  score: string;
  /** True while this innings is the one being played. */
  current: boolean;
};

type Batter = {
  id: string;
  name: string;
  position: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  /** How the batter was out, for example "c". */
  dismissal: string;
  notOut: boolean;
  /** For example "12 (12)". */
  score: string;
};

type Bowler = {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
  wides: number;
  noballs: number;
  /** For example "0/38". */
  figures: string;
};

type Scorecard = {
  /** The innings' number, from 1. */
  innings: number;
  battingTeam: string;
  battingTeamId: string;
  bowlingTeam: string;
  bowlingTeamId: string;
  /** Set on a chase. */
  target: number;
  runs: number;
  wickets: number;
  overs: number;
  runRate: number;
  /** For example "155/8". */
  score: string;
  extras: {
    total: number;
    wides: number;
    noballs: number;
    byes: number;
    legByes: number;
  };
  batting: Batter[];
  bowling: Bowler[];
  fallOfWickets: unknown[];
  partnerships: unknown[];
  /** The names of the players who did not bat. */
  didNotBat: string[];
};

type Note = Record<"innings" | "kind" | "text", unknown>;

type Ball = {
  id: string;
  /** The innings' number, from 1. */
  innings: number;
  /** The over and ball as a scorer writes them: "15.1", and "15.6" for the last. */
  over: string;
  /** The over being bowled, from 1. */
  overNumber: number;
  ball: number;
  batter: string;
  bowler: string;
  runs: number;
  boundary: boolean;
  wicket: boolean;
  /** The innings' score after this ball, for example "139/5". */
  score: string;
  /** The batting side's run rate after this ball. */
  runRate: number;
  /** What a chase still needs. Null in a first innings. */
  required: { runs: number; balls: number; runRate: number };
  shortText: string;
  text: string;
};

type Team = {
  id: string;
  name: string;
  abbreviation: string;
  homeAway: StatsSide;
  captain: string;
  keeper: string;
  players: unknown[];
};

export type CricketSummary = DeepNullable<{
  matchDetails: MatchDetails;
  /** Head-to-head rows, such as runs. */
  teamStats: TeamStat[];
  /** One row per innings. */
  innings: Innings[];
  /** One entry per innings. */
  scorecard: Scorecard[];
  notes: Note[];
  /** Ball by ball. */
  commentary: Ball[];
  /** The two teams. */
  teams: Team[];
}>;
