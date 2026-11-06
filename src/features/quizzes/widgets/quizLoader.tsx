"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type { QuizDetail } from "@/core";
import { useAuthGate, useAuthSession } from "@/features/auth";
import { Button } from "@/lib/components/button";
import { readableSegment } from "@/utils";

import styles from "../css/quizDetail.module.css";
import { useQuiz } from "../data/quiz.data";

/**
 * Loads the quiz named in the URL for a signed-in player, then hands it to
 * `children`. Covers the login prompt, loading, failure and a quiz with no
 * questions, so each quiz screen only draws the quiz itself.
 */
export function QuizLoader({ children }: { children: (quiz: QuizDetail) => ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status } = useAuthSession();
  // The quiz's code, such as `EPL-M65-Q27`; never its `_id`.
  const quiz = useQuiz(readableSegment(id), status === "authenticated");

  // A guest sees only the login prompt; NOT NOW leaves the page.
  useEffect(() => {
    if (status !== "guest") return;
    useAuthGate.getState().open({
      intent: "play this quiz",
      onCancel: () => {
        if (window.history.length > 1) router.back();
        else router.replace("/");
      },
    });
  }, [status, router]);

  if (status !== "authenticated") return <QuizPage />;
  if (!quiz.data) {
    return quiz.status === "error" ? (
      <QuizPage>
        <p className="font-sans text-sm text-muted">Couldn&apos;t load this quiz.</p>
        <Button variant="tonal" size="sm" onClick={quiz.reload}>
          TRY AGAIN
        </Button>
      </QuizPage>
    ) : (
      <QuizLoading />
    );
  }
  if (!quiz.data.questionsArray.length) {
    return (
      <QuizPage>
        <p className="font-display text-xs font-black tracking-label text-muted uppercase">
          No questions here yet
        </p>
      </QuizPage>
    );
  }
  return children(quiz.data);
}

/** The quiz's place-holder while it loads, or while a screen moves on. */
export function QuizLoading() {
  return (
    <QuizPage>
      <div
        role="status"
        aria-label="Loading quiz"
        className="h-80 w-full max-w-160 animate-pulse bg-surface-elevated/50"
      />
    </QuizPage>
  );
}

function QuizPage({ children }: { children?: ReactNode }) {
  return (
    <div
      className={`${styles.page} flex min-h-dvh flex-col items-center justify-center gap-3 px-5 text-center`}
    >
      {children}
    </div>
  );
}
