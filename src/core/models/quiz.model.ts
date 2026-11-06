import { z } from "zod";

import { listOf } from "./list-of";
import { matchEventSchema } from "./match.model";
import { teamSchema } from "./team";

/*
 * Values are case-sensitive, and the casing differs between entities: a team
 * match is `upcoming`, a race is `Upcoming`, a quiz is `UPCOMING`. Compare
 * against the exact string for the entity in hand.
 */

/** The state of a match quiz or a motorsport quiz. */
export const quizStatusSchema = z.enum([
  "UPCOMING",
  "LIVE",
  "FINISHED",
  "ENTRYNOTSTARTED",
  "ENTRYCLOSED",
  "SETTLEMENT_DONE",
  "NOT_VISIBLE",
  "ADMIN_VISIBLE",
  "ANSWER_UPDATED",
  "ABANDONED",
  "NO_RESULT",
  "NOT_ENOUGH_DATA",
  "CANCELLED",
  "POSTPONED",
  "UNRESOLVED",
  "SUSPENDED",
]);
export type QuizStatus = z.infer<typeof quizStatusSchema>;

/**
 * Closed for entries, and left alone by the live sync and auto-settlement
 * until an admin reschedules, resolves or settles the quiz.
 */
export const QUIZ_ON_HOLD_STATUSES = [
  "NO_RESULT",
  "NOT_ENOUGH_DATA",
  "POSTPONED",
  "UNRESOLVED",
] as const satisfies readonly QuizStatus[];

/** Closed for entries and never settled. */
export const QUIZ_VOID_STATUSES = [
  "CANCELLED",
] as const satisfies readonly QuizStatus[];

/** The kind of answer a quiz question takes. */
export type QuestionType = "MCQ" | "BOOLEAN" | "NUMERIC" | "ALPHABETICAL";

/** Carries no questions or answers; those need a login. */
export const quizSchema = z.object({
  _id: z.string(),
  quizId: z.string(),
  quizStatus: quizStatusSchema,
  isVisible: z.boolean(),
  matchId: z.string(),
  matchStartTime: z.string(),
  matchEvent: matchEventSchema.nullable(),
  matchEventEspnId: z.string().nullable(),
  matchBanner: z.string().nullable().optional(),
  tag: z.string(),
  gameType: z.string(),
  espnLeagueName: z.string(),
  tournament: z.string(),
  teamA: teamSchema,
  teamB: teamSchema,
  entryStartTime: z.string(),
  entryStopTime: z.string(),
  createdAt: z.string(),
});
export type Quiz = z.infer<typeof quizSchema>;

/** One question of a quiz, with how many players picked each option. */
export const quizQuestionSchema = z.object({
  questionText: z.string(),
  questionType: z.string(),
  options: z.array(z.string()),
  questionNumber: z.number(),
  xp: z.number(),
  correctAnswer: z.string().optional(),
  _id: z.string(),
  totalVotes: z.number(),
  answerVotes: z.array(
    z.object({
      selectedAnswerOption: z.string(),
      answerVotes: z.number(),
    }),
  ),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

/** One quiz with its questions and the signed-in player's own answers. */
export const quizDetailResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    quizId: z.string(),
    quizStatus: quizStatusSchema,
    tournament: z.string(),
    entryStartTime: z.string(),
    questionsArray: listOf(quizQuestionSchema),
    isVisible: z.boolean(),
    createdAt: z.string(),
    teamA: teamSchema,
    teamB: teamSchema,
    matchId: z.string(),
    matchEvent: matchEventSchema.nullable(),
    matchEventEspnId: z.string().nullable(),
    gameType: z.string(),
    matchBanner: z.string().nullable().optional(),
    matchStartTime: z.string(),
    matchStatus: z.string().optional(),
    isAttempted: z.boolean(),
    hasViewedResults: z.boolean(),
    obtainedXP: z.number(),
    quizSubmissionTime: z.string().optional(),
    userAnswers: z.object({
      /** `[]` until the player submits. */
      answers: z.array(
        z.object({
          questionNumber: z.number(),
          selectedAnswerOption: z.string(),
          selectedAnswer: z.string(),
          _id: z.string(),
        }),
      ),
      submissionTime: z.string().optional(),
    }),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type QuizDetailResponse = z.infer<typeof quizDetailResponseSchema>;
export type QuizDetail = QuizDetailResponse["data"];

export type SubmitQuizBody = {
  /** At least one; unanswered questions can be left out. */
  answers: {
    questionNumber: number;
    selectedAnswerOption: string;
    selectedAnswer: string;
  }[];
};

/** The player's new submission. XP is added once the quiz is settled. */
export const submitQuizResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    quizId: z.string(),
    userId: z.string(),
    submissionTime: z.string(),
    answers: z.array(
      z.object({
        questionNumber: z.number(),
        selectedAnswerOption: z.string(),
        selectedAnswer: z.string(),
        _id: z.string(),
      }),
    ),
    xpCredited: z.boolean(),
    hasViewedResults: z.boolean(),
    _id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type SubmitQuizResponse = z.infer<typeof submitQuizResponseSchema>;

/**
 * The player's submission once its results are marked viewed, with the right
 * answers filled in. `quizId` here is the quiz's `_id`.
 */
export const markResultsViewedResponseSchema = z.object({
  statusCode: z.number(),
  data: z.object({
    _id: z.string(),
    quizId: z.string(),
    userId: z.string(),
    submissionTime: z.string(),
    answers: z.array(
      z.object({
        questionNumber: z.number(),
        selectedAnswerOption: z.string(),
        selectedAnswer: z.string(),
        correctAnswer: z.string(),
        correctAnswerOption: z.string(),
        _id: z.string(),
      }),
    ),
    xpCredited: z.boolean(),
    hasViewedResults: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number(),
    obtainedXP: z.number(),
  }),
  message: z.string(),
  success: z.boolean(),
});
export type MarkResultsViewedResponse = z.infer<
  typeof markResultsViewedResponseSchema
>;
