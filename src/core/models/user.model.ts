import { z } from "zod";

import { authUserSchema } from "./auth.model";

export const profilePicSchema = z.object({
  _id: z.string(),
  ppId: z.string(),
  ppName: z.string(),
  ppUrl: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  coinValue: z.number(),
  isVisible: z.boolean(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});
export type ProfilePic = z.infer<typeof profilePicSchema>;

/**
 * The updated user. As in `current-user`, except the chosen pic and banner
 * come as objects. The banner's fields aren't documented yet.
 */
export const updateUserResponseSchema = z.object({
  statusCode: z.number(),
  data: authUserSchema.extend({
    profilePic: profilePicSchema.optional(),
    profileBanner: z.record(z.string(), z.unknown()).optional(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;

/**
 * Match quiz and match prediction totals only. Predictions count once
 * settled; a new user gets all 0s.
 */
export const userStatsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    totalQuizzesPlayed: z.number(),
    totalQuestionsPlayed: z.number(),
    totalCorrectAnswers: z.number(),
    totalPredictionsPlayed: z.number(),
    totalCorrectPredictions: z.number(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type UserStatsResponse = z.infer<typeof userStatsResponseSchema>;
