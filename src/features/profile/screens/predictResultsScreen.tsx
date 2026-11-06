"use client";

import { useState } from "react";

import { accentVar, withAlpha } from "@/styles";
import { formatInt } from "@/utils";

import { answerResult, formatChange, isQuizSettled } from "../adapters";
import { ResultsPage } from "../components/resultsPage";
import { StatCell } from "../components/surfaces";
import { useUserQuizzes } from "../data/profile.data";
import { HistoryEmpty, HistoryState, QuizEntry } from "../widgets/history.widget";
import { XpChips } from "../widgets/xp.widget";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "pending", label: "PENDING" },
  { id: "settled", label: "SETTLED" },
] as const;

/** `/profile/history/predict`: every match quiz the player submitted. */
export function PredictResultsScreen() {
  return (
    <ResultsPage title="PREDICT RESULTS" path="/profile/history/predict">
      <PredictResults />
    </ResultsPage>
  );
}

function PredictResults() {
  const quizzes = useUserQuizzes();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  if (!quizzes.data) {
    return (
      <HistoryState
        failed={quizzes.status === "error"}
        label="your quizzes"
        onRetry={quizzes.reload}
      />
    );
  }

  const all = quizzes.data;
  const lists = {
    all,
    pending: all.filter((quiz) => !isQuizSettled(quiz)),
    settled: all.filter(isQuizSettled),
  };
  const shown = lists[filter];
  const correct = shown.reduce(
    (sum, quiz) => sum + quiz.answers.filter((a) => answerResult(quiz, a)).length,
    0,
  );
  const xp = shown.reduce((sum, quiz) => sum + (quiz.obtainedXP ?? 0), 0);
  const label = withAlpha(accentVar("cyan"), 0.9);
  const fill = `color-mix(in srgb, var(--ds-color-background-secondary) 86%, var(--ds-color-background-elevated))`;

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="QUIZZES" labelColor={label} fill={fill}>
          {formatInt(shown.length)}
        </StatCell>
        <StatCell label="CORRECT" labelColor={label} fill={fill}>
          {formatInt(correct)}
        </StatCell>
        <StatCell label="XP" labelColor={label} fill={fill} valueColor={accentVar("cyan")}>
          {formatChange(xp)}
        </StatCell>
      </div>
      <XpChips
        label="Result"
        chips={FILTERS.map((f) => ({ ...f, count: lists[f.id].length }))}
        active={filter}
        onSelect={(id) => setFilter(id as typeof filter)}
      />
      {shown.length ? (
        <ul className="grid gap-2.5 lg:grid-cols-2">
          {shown.map((quiz) => (
            <QuizEntry key={quiz._id} quiz={quiz} />
          ))}
        </ul>
      ) : (
        <HistoryEmpty
          message={all.length ? "NO QUIZZES MATCH THIS FILTER" : "NO MATCH QUIZZES YET"}
        />
      )}
    </div>
  );
}
