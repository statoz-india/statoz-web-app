import { z } from "zod";

import { listOf } from "./list-of";

export const ledgerTypeSchema = z.enum(["CREDITED", "DEBITED"]);
export type LedgerType = z.infer<typeof ledgerTypeSchema>;

/** One coin change. */
export const coinEntrySchema = z.object({
  _id: z.string(),
  ledgerType: ledgerTypeSchema,
  /** Always positive; `ledgerType` gives the sign. Up to 2 decimals. */
  coins: z.number(),
  /** What caused it, as `PICK` or `SIGNUP_BONUS`. Kept open for new sources. */
  ledgerSource: z.string(),
  /** The balance right after this change. */
  totalCoins: z.number(),
  /** UTC. */
  date: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});
export type CoinEntry = z.infer<typeof coinEntrySchema>;

/** Newest first. */
export const coinTrackerResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    items: listOf(coinEntrySchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type CoinTrackerResponse = z.infer<typeof coinTrackerResponseSchema>;

/** The balance after each change, oldest first. */
export const coinMapResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    /** `x` is the change's UTC timestamp, `y` the balance after it. */
    points: z.array(z.object({ x: z.string(), y: z.number() })),
    /** Only the latest 1000 changes came back. */
    truncated: z.boolean(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type CoinMapResponse = z.infer<typeof coinMapResponseSchema>;
