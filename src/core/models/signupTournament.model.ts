import { z } from "zod";

import { listOf } from "./list-of";

export const signupTeamSchema = z.object({
  _id: z.string(),
  name: z.string(),
  displayName: z.string(),
  abbreviation: z.string(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  textColor: z.string().nullable(),
  /** The tournament's code, as `EPL`. */
  tournament: z.string(),
  /** Older teams are sent without `tournamentId`, `season` and `description`. */
  tournamentId: z.string().optional(),
  secondaryTextColor: z.string().nullable(),
  season: z.array(z.string()).optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SignupTeam = z.infer<typeof signupTeamSchema>;

export const signupTournamentSchema = z.object({
  _id: z.string(),
  tournament: z.string(),
  tournamentName: z.string(),
  tournamentYear: z.string(),
  gameType: z.string(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  textColor: z.string().nullable(),
  isIccTournament: z.boolean(),
  /** `null`, or left out on some tournaments. */
  displayOrder: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Sorted by `name`. */
  teams: listOf(signupTeamSchema),
});
export type SignupTournament = z.infer<typeof signupTournamentSchema>;

/** One sport's tournaments, in the order the admin set. */
export const signupSportSchema = z.object({
  sportsType: z.string(),
  /** A Material icon name. */
  icon: z.string(),
  /** Empty when nothing is chosen for the sport; the app hides it. */
  tournamentList: listOf(signupTournamentSchema),
});
export type SignupSport = z.infer<typeof signupSportSchema>;

/** Always all four sports, in the backend's order. */
export const signupTournamentsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(signupSportSchema),
  message: z.string(),
  success: z.boolean(),
});
export type SignupTournamentsResponse = z.infer<
  typeof signupTournamentsResponseSchema
>;
