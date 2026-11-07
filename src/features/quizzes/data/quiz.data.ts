import {
  dataOrThrow,
  getQuiz,
  markQuizResultsViewed,
  SIGNED_IN_TRENDING_KEY_PREFIX,
  submitQuiz,
  type ApiResult,
  type QuizDetail,
  type SignedInTrending,
} from "@/core";
import {
  loadedKeys,
  peekResource,
  setResource,
  useResource,
} from "@/hooks/useResource";
import { track } from "@/lib/analytics";

import { optionLetter } from "../adapters";

const quizKey = (id: string) => `quiz/${id}`;

/** One quiz by its code (`quizId`), with the player's answers; nothing until signed in. */
export function useQuiz(quizId: string, signedIn: boolean) {
  return useResource(
    signedIn
      ? {
          key: quizKey(quizId),
          load: () => getQuiz(quizId).then((result) => dataOrThrow(result)),
        }
      : null,
  );
}

function messageFor(result: Exclude<ApiResult<unknown>, { success: true }>) {
  // The 429 body is plain text, shared by every submit endpoint.
  if (result.statusCode === 429) return "Too many submissions. Try again in a minute.";
  return result.message;
}

/**
 * Sends the picked answers, then loads the quiz again so it shows as
 * submitted. Resolves to the error to show, or `null` once it's in.
 */
export async function sendAnswers(
  quiz: QuizDetail,
  picks: Record<number, string>,
): Promise<string | null> {
  const answers = quiz.questionsArray
    .filter((question) => question.questionNumber in picks)
    .map((question) => {
      const answer = picks[question.questionNumber];
      return {
        questionNumber: question.questionNumber,
        selectedAnswerOption: optionLetter(question.options.indexOf(answer)),
        selectedAnswer: answer,
      };
    });
  try {
    const sent = await submitQuiz(quiz._id, { answers });
    // 409: already submitted, so the review is what to show.
    if (!sent.success && sent.statusCode !== 409) {
      const reason = messageFor(sent);
      track("web_quiz_submit_failed", { quiz_id: quiz.quizId, reason });
      return reason;
    }
    if (sent.success) {
      track("web_quiz_submit", {
        quiz_id: quiz.quizId,
        sport: quiz.gameType.toLowerCase(),
        answered: answers.length,
        questions: quiz.questionsArray.length,
      });
    }
    const fresh = await getQuiz(quiz._id);
    if (!fresh.success) return "Answers sent. Refresh the page to see them.";
    // Kept under the code, which is how the page asked for it.
    setResource(quizKey(quiz.quizId), fresh.data);
    return null;
  } catch {
    const reason = "Couldn't send your answers. Try again.";
    track("web_quiz_submit_failed", { quiz_id: quiz.quizId, reason });
    return reason;
  }
}

/**
 * Marks the quiz's results as seen, before the reveal plays, and takes its
 * card out of the home screen's REVEAL RESULTS. Resolves to the XP the player
 * earned, or the error to show.
 */
export async function revealResults(
  quiz: QuizDetail,
): Promise<{ xp: number } | { error: string }> {
  try {
    const result = await markQuizResultsViewed(quiz.quizId);
    if (!result.success) return { error: result.message || "Couldn't reveal the results. Try again." };
    const xp = result.data.obtainedXP;
    const sport = quiz.gameType.toLowerCase();
    track("web_results_reveal", { quiz_id: quiz.quizId, sport, xp });
    if (xp > 0) {
      track("web_earn_virtual_currency", { virtual_currency_name: "XP", value: xp, source: "quiz" });
    }
    for (const key of loadedKeys(SIGNED_IN_TRENDING_KEY_PREFIX)) {
      const home = peekResource<SignedInTrending>(key);
      if (home) {
        setResource(key, {
          ...home,
          results: home.results.filter((r) => r.quizId !== quiz.quizId),
        });
      }
    }
    return { xp };
  } catch {
    return { error: "Couldn't reveal the results. Try again." };
  }
}

/** After CONTINUE: the page shows the settled review with the answers marked. */
export function finishReveal(quiz: QuizDetail, xp: number) {
  setResource<QuizDetail>(quizKey(quiz.quizId), {
    ...quiz,
    hasViewedResults: true,
    obtainedXP: xp,
  });
}
