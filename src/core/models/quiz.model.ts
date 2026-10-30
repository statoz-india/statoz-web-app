import { z } from "zod";

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
  matchBanner: z.string().nullable(),
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
