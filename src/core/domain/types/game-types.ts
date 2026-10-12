import { Tournament } from "@/core/domain/models/common/tournament-model";
import {
  Matches,
  MotorSportMatches,
} from "@/core/domain/models/public/match-model";

export type GameType =
  | "trending"
  | "football"
  | "cricket"
  | "basketball"
  | "tennis"
  | "racing";

/** The sections the matches endpoint accepts. Tennis has games only. */
export type MatchGameType = Exclude<GameType, "tennis">;

/** The sports that have match stats. */
export type StatsGameType = Exclude<GameType, "trending" | "tennis">;

/** Which of the two teams a stat, an event or a player belongs to. */
export type StatsSide = "home" | "away";

export type StatsLocation = {
  venue: string;
  city: string;
  country: string;
  neutralSite: boolean;
};

/**
 * `T` as match stats have to be read: any field can be null, at every depth,
 * above all before and early in a match. A list is still a list, but it can be
 * empty.
 */
export type DeepNullable<T> = T extends readonly (infer Item)[]
  ? DeepNullable<Item>[]
  : T extends object
    ? { [Key in keyof T]: DeepNullable<T[Key]> | null }
    : T;

/** One tournament's matches for a day, ordered by start time. */
export type TournamentSection<TMatch = Matches | MotorSportMatches> = {
  tournament: string;
  /** Null if the tournament record is missing. */
  tournamentData: Tournament | null;
  matchCount: number;
  matches: TMatch[];
};
