"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { QuizDetail } from "@/core";
import { useNow } from "@/hooks/useNow";
import { quizResultsHref } from "@/utils";

import { showsResults } from "../adapters";
import { PredictionLocked } from "../widgets/predictionLocked";
import { QuizLoader, QuizLoading } from "../widgets/quizLoader";
import { QuizPlay } from "../widgets/quizPlay";
import { QuizReview } from "../widgets/quizReview";

/** `/quiz/[id]`: play a match quiz, or review it once submitted. Needs an account. */
export function QuizDetailScreen() {
  return <QuizLoader>{(quiz) => <PlayOrReview quiz={quiz} />}</QuizLoader>;
}

function PlayOrReview({ quiz }: { quiz: QuizDetail }) {
  const router = useRouter();
  const now = useNow();
  // Held here: the play screen swaps to the review under the overlay.
  const [sealed, setSealed] = useState<number | null>(null);
  // Once the match is live or over, or kick-off has passed, every player moves
  // on to the results, after any PREDICTION LOCKED overlay has finished.
  const moving = showsResults(quiz, now) && sealed === null;

  useEffect(() => {
    if (moving) router.replace(quizResultsHref(quiz.quizId));
  }, [moving, router, quiz.quizId]);

  if (moving) return <QuizLoading />;
  return (
    <>
      {quiz.isAttempted ? (
        <QuizReview quiz={quiz} />
      ) : (
        <QuizPlay quiz={quiz} onSubmitted={setSealed} />
      )}
      {sealed !== null ? (
        <PredictionLocked
          count={quiz.questionsArray.length}
          potentialXp={sealed}
          onDone={() => setSealed(null)}
        />
      ) : null}
    </>
  );
}
