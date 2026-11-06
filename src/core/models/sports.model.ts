import { z } from "zod";

export const sportsTypeSchema = z.object({
  sportsType: z.string(),
  icon: z.string(),
});
export type SportsType = z.infer<typeof sportsTypeSchema>;

export const sportsTypesResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(sportsTypeSchema),
  message: z.string(),
  success: z.boolean(),
});
export type SportsTypesResponse = z.infer<typeof sportsTypesResponseSchema>;

export const matchSportsTypeSchema = z.object({
  gameType: z.string(),
  icon: z.string(),
});
export type MatchSportsType = z.infer<typeof matchSportsTypeSchema>;

export const matchSportsTypesResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(matchSportsTypeSchema),
  message: z.string(),
  success: z.boolean(),
});
export type MatchSportsTypesResponse = z.infer<
  typeof matchSportsTypesResponseSchema
>;
