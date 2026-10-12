import type { Event } from "./event-model";
import type { Future } from "./future-model";
import type { Matches } from "./match-model";
import type { Prediction } from "./prediction-model";
import type { Quiz } from "./quiz-model";

/** A fixture as the trending list sends it, without the volume fields. */
export type TrendingMatch = Omit<
  Matches,
  "predictionVolume" | "eventVolume" | "totalVolume"
>;

type TrendingItemOf<TType extends string, TData> = {
  _id: string;
  type: TType;
  /** Display position. It can have gaps where an item is hidden. */
  order: number;
  data: TData;
};

/** Narrow on `type` to get the matching `data`. */
export type TrendingItem =
  | TrendingItemOf<"prediction", Prediction>
  | TrendingItemOf<"event", Event>
  | TrendingItemOf<"future", Future>
  | TrendingItemOf<"quiz", Quiz>
  | TrendingItemOf<"match", TrendingMatch>;

export type TrendingMatches = {
  /** Already in display order. */
  items: TrendingItem[];
  /** How many picks, futures and events are upcoming or live. */
  counts: {
    picks: number;
    futures: number;
    events: number;
  };
};
