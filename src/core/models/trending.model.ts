import { z } from "zod";

import { eventSchema } from "./event.model";
import { futureSchema } from "./future.model";
import { listOf } from "./list-of";
import {
  matchesSchema,
  matchStatusSchema,
  motorSportMatchesSchema,
} from "./match.model";
import { predictionSchema } from "./prediction.model";
import { quizSchema } from "./quiz.model";
import { tournamentSummarySchema } from "./tournament";

/*
 * The trending response split into one list per kind. Each item is the same
 * record as its own model, less the fields this response leaves out.
 */

/** A prediction in `trendingPredictions`. */
export const trendingPredictionSchema = predictionSchema.extend({
  /** `{}` when the tournament record is missing. */
  tournamentData: tournamentSummarySchema.partial(),
});
export type TrendingPrediction = z.infer<typeof trendingPredictionSchema>;

/** A quiz in `trendingQuizzes`: no `matchBanner`. */
export const trendingQuizSchema = quizSchema.omit({ matchBanner: true });
export type TrendingQuiz = z.infer<typeof trendingQuizSchema>;

/** An event in `trendingEvents`: no description or images. */
export const trendingEventSchema = eventSchema.omit({
  eventDescription: true,
  eventImage: true,
  eventDescriptionImage: true,
});
export type TrendingEvent = z.infer<typeof trendingEventSchema>;

/** A fixture in `clubsAndTeamMatches`: no banner and no volume fields. */
export const clubsAndTeamMatchSchema = matchesSchema.omit({
  matchBanner: true,
  predictionVolume: true,
  eventVolume: true,
  totalVolume: true,
});
export type ClubsAndTeamMatch = z.infer<typeof clubsAndTeamMatchSchema>;

/** A fixture in `trendingMatches`. */
export const trendingFixtureSchema = clubsAndTeamMatchSchema.extend({
  /** Missing on some fixtures. */
  matchStatus: matchStatusSchema.optional(),
});
export type TrendingFixture = z.infer<typeof trendingFixtureSchema>;

/** A race in `trendingRaces`. */
export const trendingRaceSchema = motorSportMatchesSchema.extend({
  isVisible: z.boolean(),
});
export type TrendingRace = z.infer<typeof trendingRaceSchema>;

export const trendingSchema = z.object({
  trendingPicks: listOf(predictionSchema),
  /** Empty in every sample so far, so its items are not modelled yet. */
  results: z.array(z.unknown()),
  clubsAndTeamMatches: listOf(clubsAndTeamMatchSchema),
  trendingFutures: listOf(futureSchema),
  trendingMatches: listOf(trendingFixtureSchema),
  trendingRaces: listOf(trendingRaceSchema),
  trendingQuizzes: listOf(trendingQuizSchema),
  trendingEvents: listOf(trendingEventSchema),
  trendingPredictions: listOf(trendingPredictionSchema),
});
export type Trending = z.infer<typeof trendingSchema>;

export const trendingResponseSchema = z.object({
  statusCode: z.number(),
  data: trendingSchema,
  message: z.string(),
  success: z.boolean(),
});
export type TrendingResponse = z.infer<typeof trendingResponseSchema>;
