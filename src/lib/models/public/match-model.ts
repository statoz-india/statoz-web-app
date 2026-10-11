import type { Team } from "@/lib/models/common/team-model";
import type { GameType, MatchGameType } from "@/lib/types/game-types";
import type { MatchStatus, RaceStatus } from "@/lib/types/match-type";

export type MatchEvent = Record<
  | "id"
  | "uid"
  | "name"
  | "shortName"
  | "home"
  | "away"
  | "score"
  | "status"
  | "startTime"
  | "endTime"
  | "homeTeamScore"
  | "awayTeamScore"
  | "summary",
  unknown
>;

export type Matches = {
  _id: string;
  matchId: string;
  matchStartTime: string;
  matchStatus: MatchStatus;
  /** Null until the feed has data. */
  matchEvent: MatchEvent | null;
  matchBanner: string | null;
  tag: string;
  gameType: GameType;
  tournament: string;
  espnLeagueName: string;
  teamA: Team;
  teamB: Team;
  /** Empty when the match has no quiz. Opening one needs a login. */
  quizIds: string[];
  /** Empty when the match has no pick. Placing one needs a login. */
  predictionIds: string[];
  /** Coins on the match's markets. */
  predictionVolume: number;
  eventVolume: number;
  totalVolume: number;
  createdAt: string;
};

/** The backend leaves an unset field out of a race instead of sending null. */
export type MotorSportMatches = {
  _id: string;
  matchId: string;
  name: string;
  description?: string;
  tournament: string;
  tournamentId: string;
  seasonYear: string;
  tag?: string;
  gameType: "racing";
  matchStatus: RaceStatus;
  raceEventStartDate: string;
  raceEventStopDate: string;
  /** Missing while the race has no session time yet. */
  raceStartTime?: string;
  espnLeagueName?: string;
  summary?: unknown;
  createdAt: string;
  updatedAt: string;
};

/** What a section's `matches` holds: races for `racing`, fixtures otherwise. */
export type MatchFor<G extends MatchGameType> = G extends "racing"
  ? MotorSportMatches
  : Matches;
