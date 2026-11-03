import { z } from "zod";

export const sendOtpResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({}),
  message: z.string(),
  success: z.boolean(),
});
export type SendOtpResponse = z.infer<typeof sendOtpResponseSchema>;

/** `totalXP`, plus one key per tournament or game; new ones come without an API change. */
const xpSchema = z.object({ totalXP: z.number() }).catchall(z.number());

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
  xp: xpSchema,
  gameXp: xpSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  /** Missing until a new account finishes profile setup. */
  userName: z.string().optional(),
  /** Saved only when the account is created. */
  deviceType: z.string().optional(),
  /** Set once the account has signed in with Google. */
  firebaseUid: z.string().optional(),
  /** The Google profile photo, when the Google account has one. */
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  /** The chosen preset avatar's id; `avatarUrl` already holds its image. */
  profilePic: z.string().optional(),
  /** The chosen preset banner's id; `bannerUrl` already holds its image. */
  profileBanner: z.string().optional(),
  clubAndTeams: z.array(
    z.object({ tournament: z.string(), teams: z.array(z.string()) }),
  ),
  sportsType: z.array(z.string()),
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

/**
 * Signs in an existing account, or creates one. Email OTP and Google sign-in
 * both answer with this.
 */
export const loginSignupResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    user: authUserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
    isNewUser: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type LoginSignupResponse = z.infer<typeof loginSignupResponseSchema>;

/** The same user as in the login responses, but as `data` itself. */
export const currentUserResponseSchema = z.object({
  statusCode: z.number(),
  data: authUserSchema,
  message: z.string(),
  success: z.boolean(),
});
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;

export const refreshTokenResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;

export const logoutResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({}),
  message: z.string(),
  success: z.boolean(),
});
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
