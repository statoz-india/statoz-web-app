import { z } from "zod";

import { listOf } from "./list-of";

/** Every team abbreviation with at least one item of a type, A–Z. */
export const shopTeamsResponseSchema = z.object({
  statusCode: z.number(),
  data: z.array(z.string()),
  message: z.string(),
  success: z.boolean(),
});
export type ShopTeamsResponse = z.infer<typeof shopTeamsResponseSchema>;

/** The fields every shop item shares. Ownership isn't included. */
const shopItemFields = {
  _id: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  coinValue: z.number(),
  isVisible: z.boolean(),
  __v: z.number(),
  /** `true` when `coinValue` is 0. */
  isFree: z.boolean(),
};

export const shopProfilePicSchema = z.object({
  ...shopItemFields,
  /** What `update-user` takes to set the pic. */
  ppId: z.string(),
  ppName: z.string(),
  /** A full image URL. */
  ppUrl: z.string(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ShopProfilePic = z.infer<typeof shopProfilePicSchema>;

/** A banner that costs coins. Ownership isn't included. */
export const paidProfileBannerSchema = z.object({
  _id: z.string(),
  /** What `purchase` and `update-user` take. */
  pbId: z.string(),
  pbName: z.string(),
  /** A full image URL. */
  pbUrl: z.string(),
  team: z.string(),
  teamAbbreviation: z.string(),
  sport: z.string(),
  /** Always above 0. */
  coinValue: z.number(),
  isVisible: z.boolean(),
  assignedUser: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});
export type PaidProfileBanner = z.infer<typeof paidProfileBannerSchema>;

/** Newest first, one page at a time. */
export const paidProfileBannersResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    items: listOf(paidProfileBannerSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type PaidProfileBannersResponse = z.infer<
  typeof paidProfileBannersResponseSchema
>;

export const shopPlayerCardSchema = z.object({
  ...shopItemFields,
  playerId: z.string(),
  name: z.string(),
  /** As `M JR`. Not every sport sends it. */
  shortName: z.string().optional(),
  /** A full image URL. */
  image: z.string(),
  drop: z.string(),
  ratings: z.number(),
  /** As `BAT` or `SF`. */
  position: z.string(),
  /** As `SHARPSHOOTER`. Not every sport sends it. */
  trait: z.string().optional(),
  /** As `attacker`. Not every sport sends it. */
  playerType: z.string().optional(),
  /** `bronze`, `silver`, `gold` or `platinum`. */
  cardType: z.string(),
  cardTraining: z.number(),
  finalRating: z.number(),
});
export type ShopPlayerCard = z.infer<typeof shopPlayerCardSchema>;

/** Newest first. An unknown team answers `[]`. */
const itemsResponse = <T extends z.ZodType>(item: T) =>
  z.object({
    statusCode: z.number(),
    data: listOf(item),
    message: z.string(),
    success: z.boolean(),
  });

export const shopProfilePicsResponseSchema = itemsResponse(shopProfilePicSchema);
export const shopPlayerCardsResponseSchema = itemsResponse(shopPlayerCardSchema);
