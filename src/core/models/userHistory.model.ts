import { z } from "zod";

import { listOf } from "./list-of";
import { teamSchema } from "./team";

/** One match quiz the player submitted. */
export const userQuizSchema = z.object({
  _id: z.string(),
  /** The quiz's Mongo `_id`, for `GET /api/v1/quiz/:id`. */
  quizId: z.string(),
  submissionTime: z.string(),
  answers: z.array(
    z.object({
      questionNumber: z.number(),
      selectedAnswerOption: z.string(),
      selectedAnswer: z.string(),
      _id: z.string(),
    }),
  ),
  /** Missing until the quiz is settled. */
  obtainedXP: z.number().optional(),
  xpCredited: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  quizData: z.object({
    teamA: teamSchema,
    teamB: teamSchema,
    matchId: z.string(),
    matchStartTime: z.string(),
    /**
     * `ENTRYNOTSTARTED`, `UPCOMING`, `LIVE`, `ENTRYCLOSED`, `FINISHED` or
     * `SETTLEMENT_DONE`.
     */
    quizStatus: z.string(),
    tournament: z.string(),
  }),
  /** Keyed by question number; a question appears once its answer is set. */
  correctAnswersByQuestionNumber: z.record(z.string(), z.string()),
});
export type UserQuiz = z.infer<typeof userQuizSchema>;

/** Newest first, the whole history at once. */
export const userQuizzesResponseSchema = z.object({
  statusCode: z.number(),
  data: listOf(userQuizSchema),
  message: z.string(),
  success: z.boolean(),
});
export type UserQuizzesResponse = z.infer<typeof userQuizzesResponseSchema>;

/** One match prediction bet; two bets on a match are two entries. */
export const userPredictionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  /** The prediction's Mongo `_id`. */
  predictionId: z.string(),
  /** `A`, `B`, or `D` for a draw (football only). */
  teamChosen: z.string(),
  coinsBet: z.number(),
  /** Profit on a win; 0 while pending or after a loss. */
  coinsWon: z.number(),
  /** `coinsBet + coinsWon` on a win; 0 otherwise. */
  totalCoinsReceived: z.number(),
  submissionTime: z.string(),
  /** `PENDING`, `PAID`, `LOST`, `PROCESSING`, `COMPLETED` or `FAILED`. */
  payoutStatus: z.string(),
  createdAt: z.string(),
  /** The pools and odds are live values, not the ones at the time of the bet. */
  predictionData: z.object({
    teamA: teamSchema,
    teamB: teamSchema,
    matchId: z.string(),
    gameType: z.string(),
    tournament: z.string(),
    /** `UPCOMING`, `ACTIVE`, `LIVE`, `FINISHED`, `SETTLEMENT_DONE` or `CANCELLED`. */
    predictionStatus: z.string(),
    coinsOnTeamA: z.number(),
    coinsOnTeamB: z.number(),
    coinsOnDraw: z.number(),
    initialCoinsOnTeamA: z.number(),
    initialCoinsOnTeamB: z.number(),
    initialCoinsOnDraw: z.number(),
    totalCoins: z.number(),
    oddsTeamA: z.number(),
    oddsTeamB: z.number(),
    /** `null` outside football. */
    oddsDraw: z.number().nullable(),
  }),
});
export type UserPrediction = z.infer<typeof userPredictionSchema>;

/** Newest first, the whole history at once. */
export const userPredictionsResponseSchema = z.object({
  statusCode: z.number(),
  data: listOf(userPredictionSchema),
  message: z.string(),
  success: z.boolean(),
});
export type UserPredictionsResponse = z.infer<
  typeof userPredictionsResponseSchema
>;
