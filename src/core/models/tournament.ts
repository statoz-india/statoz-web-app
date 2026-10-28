import { z } from "zod";

import { gameTypeSchema } from "./game-type";
import { listOf } from "./list-of";
import type { Matches, MotorSportMatches } from "./match";

/** The tournament fields a trending item carries. */
export const tournamentSummarySchema = z.object({
  tournament: z.string(),
  tournamentName: z.string(),
  tournamentYear: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  textColor: z.string(),
});
export type TournamentSummary = z.infer<typeof tournamentSummarySchema>;

export const tournamentSchema = tournamentSummarySchema.extend({
  _id: z.string(),
  gameType: gameTypeSchema,
  displayOrder: z.number().nullable(),
});
export type Tournament = z.infer<typeof tournamentSchema>;

/** One tournament's matches for a day, ordered by start time. */
export type TournamentSection<TMatch = Matches | MotorSportMatches> = {
  tournament: string;
  /** Null if the tournament record is missing. */
  tournamentData: Tournament | null;
  matchCount: number;
  matches: TMatch[];
};

/** A {@link TournamentSection} whose `matches` are read with `match`. */
export function tournamentSectionSchema<TMatch>(
  match: z.ZodType<TMatch>,
): z.ZodType<TournamentSection<TMatch>> {
  return z.object({
    tournament: z.string(),
    tournamentData: tournamentSchema.nullable(),
    matchCount: z.number(),
    matches: listOf(match),
  });
}
