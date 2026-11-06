import type { QuizDetail, QuizQuestion, QuizStatus } from "@/core";
import { formatKickoffTime, formatStatus, quizHref, quizResultsHref } from "@/utils";

/** How the API matches answers: case and outer spaces don't count. */
const sameText = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** `A`, `B`, … for an option's place. */
export const optionLetter = (index: number) => String.fromCharCode(65 + index);

/** The player's answer to a question, as the option's text. */
export const pickFor = (quiz: QuizDetail, questionNumber: number) =>
  quiz.userAnswers.answers.find((answer) => answer.questionNumber === questionNumber)
    ?.selectedAnswer;

/** Whether `option` is the settled answer; always false before settlement. */
export const isCorrectOption = (question: QuizQuestion, option: string) =>
  question.correctAnswer !== undefined && sameText(option, question.correctAnswer);

export type OptionState = "selected" | "correct" | "wrong";

/** The settled answer is green; the pick is cyan, or red once it's marked wrong. */
export function optionState(
  question: QuizQuestion,
  option: string,
  pick: string | undefined,
): OptionState | undefined {
  if (isCorrectOption(question, option)) return "correct";
  if (pick === undefined || !sameText(pick, option)) return undefined;
  return question.correctAnswer === undefined ? "selected" : "wrong";
}

/** `null` before settlement, or when the player left the question out. */
export function verdict(question: QuizQuestion, pick: string | undefined) {
  if (question.correctAnswer === undefined || pick === undefined) return null;
  return isCorrectOption(question, pick) ? "correct" : "wrong";
}

/** Only an `UPCOMING` quiz takes answers, and only until kick-off. */
export const isLocked = (quiz: QuizDetail, now: number | null) =>
  quiz.quizStatus !== "UPCOMING" ||
  (now !== null && now >= Date.parse(quiz.matchStartTime));

/** `38:29:28`: hours, minutes and seconds; hours run past 24. */
export function formatCountdown(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

export const totalXp = (questions: QuizQuestion[]) =>
  questions.reduce((sum, question) => sum + question.xp, 0);

/** The match is over, whether or not the answers are marked. */
const OVER: QuizStatus[] = [
  "FINISHED",
  "ANSWER_UPDATED",
  "SETTLEMENT_DONE",
  "NO_RESULT",
  "NOT_ENOUGH_DATA",
  "UNRESOLVED",
];

/**
 * The header clock: the match's own status when the API sends one, else
 * kick-off in India time, `LIVE`, or `FINISHED`.
 */
export function fixtureClock(quiz: QuizDetail) {
  if (quiz.matchStatus) {
    const key = quiz.matchStatus.toLowerCase();
    const tone = key === "live" ? "live" : key === "upcoming" ? "time" : "over";
    return { text: formatStatus(quiz.matchStatus), tone } as const;
  }
  if (quiz.quizStatus === "LIVE") return { text: "LIVE", tone: "live" } as const;
  if (OVER.includes(quiz.quizStatus)) {
    return { text: "FINISHED", tone: "over" } as const;
  }
  return { text: formatKickoffTime(quiz.matchStartTime), tone: "time" } as const;
}

/**
 * What the results check needs. Only the quiz detail sends `matchStatus`, and
 * not always.
 */
type QuizTiming = {
  quizId: string;
  quizStatus: QuizStatus;
  matchStartTime: string;
  matchStatus?: string;
};

/** A match's own statuses once it is under way or over; a race's are capitalised. */
const MATCH_UNDER_WAY = new Set(["live", "result", "no_result", "unresolved", "ongoing", "finished"]);

/** Whether the quiz's status says the match is over. */
export const isOver = (quiz: Pick<QuizTiming, "quizStatus">) => OVER.includes(quiz.quizStatus);

/** Kick-off has passed; `now` is `null` until the clock starts. */
export const isKickedOff = (matchStartTime: string, now: number | null) =>
  now !== null && now >= Date.parse(matchStartTime);

/**
 * Once the match is live or over, by the quiz's status or the match's own,
 * or kick-off has passed, the quiz opens on its results instead of play.
 */
export const showsResults = (quiz: QuizTiming, now: number | null) =>
  quiz.quizStatus === "LIVE" ||
  isOver(quiz) ||
  MATCH_UNDER_WAY.has(quiz.matchStatus?.toLowerCase() ?? "") ||
  isKickedOff(quiz.matchStartTime, now);

/** Where a quiz card leads: its results once {@link showsResults}, else play. */
export const quizLink = (quiz: QuizTiming, now: number | null) =>
  showsResults(quiz, now) ? quizResultsHref(quiz.quizId) : quizHref(quiz.quizId);

/**
 * The player entered this quiz, it is settled, and they haven't revealed it:
 * the crowd screen hides the answers and offers REVEAL RESULTS.
 */
export const awaitsReveal = (quiz: QuizDetail) =>
  quiz.isAttempted && quiz.quizStatus === "SETTLEMENT_DONE" && !quiz.hasViewedResults;

/** The quiz as the player sees it before the reveal: picks only, no answers. */
export const withoutAnswers = (quiz: QuizDetail): QuizDetail => ({
  ...quiz,
  questionsArray: quiz.questionsArray.map((q) => ({ ...q, correctAnswer: undefined })),
});

export type RevealRow = {
  question: string;
  /** The player's pick, or `—` when they left the question out. */
  picked: string;
  answer: string;
  correct: boolean;
  /** The question's XP when right, else 0. */
  xp: number;
};

/** One row per question for the settlement reveal; a skipped question is wrong. */
export const revealRows = (quiz: QuizDetail): RevealRow[] =>
  quiz.questionsArray.map((question) => {
    const pick = pickFor(quiz, question.questionNumber);
    const correct = verdict(question, pick) === "correct";
    return {
      question: question.questionText,
      picked: pick ?? "—",
      answer: question.correctAnswer ?? "—",
      correct,
      xp: correct ? question.xp : 0,
    };
  });

export type CrowdRow = { label: string; votes: number; share: number; right: boolean };

const SCORE = /^\s*(\d+)\s*-\s*(\d+)\s*$/;
const SCORE_ROWS = 5;

/** `"3 - 1"` → 4; only called on labels that match {@link SCORE}. */
const goals = (label: string) => {
  const [, home, away] = SCORE.exec(label) ?? [];
  return Number(home) + Number(away);
};

/**
 * Each option with its votes and share. A score question shows its five
 * most-voted scorelines, the real result always among them, by votes with
 * ties to the lower score; any other question keeps every option in order.
 */
export function crowdRows(question: QuizQuestion): CrowdRow[] {
  const rows = question.options.map((label) => {
    const votes =
      question.answerVotes.find((v) => v.selectedAnswerOption === label)?.answerVotes ?? 0;
    return {
      label,
      votes,
      share: question.totalVotes ? Math.round((votes / question.totalVotes) * 100) : 0,
      right: isCorrectOption(question, label),
    };
  });
  if (!rows.length || !rows.every((row) => SCORE.test(row.label))) return rows;

  const sorted = rows.sort((a, b) => b.votes - a.votes || goals(a.label) - goals(b.label));
  const top = sorted.slice(0, SCORE_ROWS);
  const right = sorted.find((row) => row.right);
  if (right && !top.includes(right)) top[top.length - 1] = right;
  return top;
}

/**
 * Votes for the real answers out of all votes, across the questions that
 * have one; `null` until any answer is marked.
 */
export function crowdAccuracy(questions: QuizQuestion[]) {
  const marked = questions.filter((q) => q.correctAnswer !== undefined);
  if (!marked.length) return null;
  const matched = marked.reduce(
    (sum, q) => sum + (crowdRows(q).find((row) => row.right)?.votes ?? 0),
    0,
  );
  const total = marked.reduce((sum, q) => sum + q.totalVotes, 0);
  return { matched, total };
}
