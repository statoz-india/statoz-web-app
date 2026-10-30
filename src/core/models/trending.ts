import { z } from "zod";

import { eventSchema } from "./event.model";
import { futureSchema } from "./future.model";
import { listOf } from "./list-of";
import { matchesSchema } from "./match.model";
import { predictionSchema } from "./prediction.model";
import { quizSchema } from "./quiz.model";

/** A fixture as the trending list sends it, without the volume fields. */
export const trendingMatchSchema = matchesSchema.omit({
  predictionVolume: true,
  eventVolume: true,
  totalVolume: true,
});
export type TrendingMatch = z.infer<typeof trendingMatchSchema>;

function trendingItemOf<TType extends string, TData extends z.ZodType>(
  type: TType,
  data: TData,
) {
  return z.object({
    _id: z.string(),
    type: z.literal(type),
    /** Display position. It can have gaps where an item is hidden. */
    order: z.number(),
    data,
  });
}

/** Narrow on `type` to get the matching `data`. */
export const trendingItemSchema = z.discriminatedUnion("type", [
  trendingItemOf("prediction", predictionSchema),
  trendingItemOf("event", eventSchema),
  trendingItemOf("future", futureSchema),
  trendingItemOf("quiz", quizSchema),
  trendingItemOf("match", trendingMatchSchema),
]);
export type TrendingItem = z.infer<typeof trendingItemSchema>;

export const trendingMatchesSchema = z.object({
  /** Already in display order. */
  items: listOf(trendingItemSchema),
  /** How many picks, futures and events are upcoming or live. */
  counts: z.object({
    picks: z.number(),
    futures: z.number(),
    events: z.number(),
  }),
});
export type TrendingMatches = z.infer<typeof trendingMatchesSchema>;
