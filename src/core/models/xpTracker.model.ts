import { z } from "zod";

import { listOf } from "./list-of";

export const xpTypeSchema = z.enum(["CREDITED", "DEBITED"]);
export type XpType = z.infer<typeof xpTypeSchema>;

export const xpSourceSchema = z.enum([
  "TOURNAMENT",
  "GAME",
  "ADMIN_ADJUSTMENT",
  "OPENING_BALANCE",
]);
export type XpSource = z.infer<typeof xpSourceSchema>;

/** One XP change. */
export const xpEntrySchema = z.object({
  _id: z.string(),
  xpType: xpTypeSchema,
  /** Always positive; `xpType` gives the sign. Up to 2 decimals. */
  xp: z.number(),
  xpSource: xpSourceSchema,
  /** The tournament or game code that changed, as `IPL` or `pitchDuel`. */
  scopeKey: z.string(),
  /** That code's XP right after this change. */
  scopeXP: z.number(),
  /** UTC. */
  date: z.string(),
  /** The pool's total right after this change, not the player's overall XP. */
  totalXP: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});
export type XpEntry = z.infer<typeof xpEntrySchema>;

/** Newest first. */
export const xpTrackerResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    items: listOf(xpEntrySchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type XpTrackerResponse = z.infer<typeof xpTrackerResponseSchema>;

/** Net XP per IST day, oldest first. Days with no XP are left out. */
export const xpMapResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    points: z.array(z.object({ x: z.string(), y: z.number() })),
    /** Only the latest 1000 days came back. */
    truncated: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type XpMapResponse = z.infer<typeof xpMapResponseSchema>;
