"use client";

import { useState } from "react";

import type { QuizDetail } from "@/core";

import { awaitsReveal } from "../adapters";
import { finishReveal, revealResults } from "../data/quiz.data";
import { QuizCrowd } from "../widgets/quizCrowd";
import { QuizLoader } from "../widgets/quizLoader";
import { RevealDock, RevealOverlay } from "../widgets/revealResults";

/**
 * `/quiz/[id]/results`: the crowd's picks and the real answers, for every
 * player once the match is live or over. Needs an account.
 */
export function QuizResultsScreen() {
  return <QuizLoader>{(quiz) => <CrowdWithReveal quiz={quiz} />}</QuizLoader>;
}

/** The crowd screen, with REVEAL RESULTS and its overlay while the player's settled entry is unrevealed. */
function CrowdWithReveal({ quiz }: { quiz: QuizDetail }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<number | null>(null);

  async function reveal() {
    setPending(true);
    setError(null);
    const result = await revealResults(quiz);
    setPending(false);
    if ("error" in result) setError(result.error);
    else setRevealed(result.xp);
  }

  return (
    <>
      <QuizCrowd
        quiz={quiz}
        footer={
          awaitsReveal(quiz) && revealed === null ? (
            <RevealDock pending={pending} error={error} onReveal={() => void reveal()} />
          ) : null
        }
      />
      {revealed !== null ? (
        <RevealOverlay
          quiz={quiz}
          xp={revealed}
          onDone={() => {
            finishReveal(quiz, revealed);
            setRevealed(null);
          }}
        />
      ) : null}
    </>
  );
}
