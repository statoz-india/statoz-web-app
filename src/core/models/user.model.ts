import { z } from "zod";

import { authUserSchema } from "./auth.model";

export const profilePicSchema = z.object({
  _id: z.string(),
  ppId: z.string(),
  ppName: z.string(),
  ppUrl: z.string(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  coinValue: z.number(),
  ppDescription: z.string().optional(),
  team: z.string(),
  teamAbbreviation: z.string(),
  isVisible: z.boolean(),
});
export type ProfilePic = z.infer<typeof profilePicSchema>;

export const profileBannerSchema = z.object({
  isVisible: z.boolean(),
  _id: z.string(),
  pbId: z.string(),
  pbName: z.string(),
  pbUrl: z.string(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
  coinValue: z.number(),
  team: z.string(),
  teamAbbreviation: z.string(),
});
export type ProfileBanner = z.infer<typeof profileBannerSchema>;

/**
 * The updated user. As in `current-user`, except the chosen pic and banner
 * come as objects.
 */
export const updateUserResponseSchema = z.object({
  statusCode: z.number(),
  data: authUserSchema.extend({
    profilePic: profilePicSchema.optional(),
    profileBanner: profileBannerSchema.optional(),
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

export const userAssetPicSchema = z.object({
  _id: z.string(),
  ppId: z.string(),
  ppName: z.string(),
  ppDescription: z.string().optional(),
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
export type UserAssetPic = z.infer<typeof userAssetPicSchema>;

export const userAssetBannerSchema = z.object({
  _id: z.string(),
  pbId: z.string(),
  pbName: z.string(),
  pbUrl: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  drop: z.string(),
  sport: z.string(),
  coinValue: z.number(),
  isVisible: z.boolean(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});
export type UserAssetBanner = z.infer<typeof userAssetBannerSchema>;

/**
 * The pics and banners the player bought, oldest first, each with the full
 * item; an item deleted from the store comes back `null`. A player who owns
 * nothing gets empty lists and no `_id` or timestamps.
 */
export const userAssetsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string().optional(),
    userId: z.string(),
    __v: z.number().optional(),
    createdAt: z.string().optional(),
    profileBannersPurchased: z.array(
      z.object({
        profileBannerId: userAssetBannerSchema.nullable(),
        purchasedAt: z.string(),
        coinsUsed: z.number(),
        _id: z.string(),
      }),
    ),
    profilePicsPurchased: z.array(
      z.object({
        profilePicId: userAssetPicSchema.nullable(),
        purchasedAt: z.string(),
        coinsUsed: z.number(),
        _id: z.string(),
      }),
    ),
    updatedAt: z.string().optional(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type UserAssetsResponse = z.infer<typeof userAssetsResponseSchema>;
