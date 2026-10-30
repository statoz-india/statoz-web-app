import { z } from "zod";

export const sendOtpResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({}),
  message: z.string(),
  success: z.boolean(),
});
export type SendOtpResponse = z.infer<typeof sendOtpResponseSchema>;

export const authUserSchema = z.object({
  _id: z.string(),
  email: z.string(),
  authProvider: z.string(),
  emailVerified: z.boolean(),
  userType: z.string(),
  userStatus: z.string(),
  coins: z.number(),
  showQuizWalkthrough: z.boolean(),
  showPredictionWalkThrough: z.boolean(),
  showPenaltyShootoutTooltip: z.boolean(),
  showPitchDuelTooltip: z.boolean(),
  showHomePageInfoBanner: z.boolean(),
  xp: z.object({ totalXP: z.number() }),
  gameXp: z.object({ totalXP: z.number() }),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  userName: z.string(),
  clubAndTeams: z.array(z.unknown()),
  sportsType: z.array(z.unknown()),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    user: authUserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
