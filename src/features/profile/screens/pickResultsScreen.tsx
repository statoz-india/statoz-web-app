"use client";

import { useState } from "react";

import { accentVar, withAlpha } from "@/styles";
import { formatInt, formatOzCompact } from "@/utils";

import { formatChange, pickNet, pickResult } from "../adapters";
import { ResultsPage } from "../components/resultsPage";
import { StatCell } from "../components/surfaces";
import { useUserPredictions } from "../data/profile.data";
import { HistoryEmpty, HistoryState, PickEntry } from "../widgets/history.widget";
import { XpChips } from "../widgets/xp.widget";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "pending", label: "PENDING" },
  { id: "won", label: "WON" },
  { id: "lost", label: "LOST" },
] as const;

/** `/profile/history/pick`: every match prediction bet the player placed. */
export function PickResultsScreen() {
  return (
    <ResultsPage title="PICK RESULTS" path="/profile/history/pick">
      <PickResults />
    </ResultsPage>
  );
}

function PickResults() {
  const predictions = useUserPredictions();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  if (!predictions.data) {
    return (
      <HistoryState
        failed={predictions.status === "error"}
        label="your picks"
        onRetry={predictions.reload}
      />
    );
  }

  const all = predictions.data;
  const lists = {
    all,
    pending: all.filter((pick) => pickResult(pick) === "pending"),
    won: all.filter((pick) => pickResult(pick) === "won"),
    lost: all.filter((pick) => pickResult(pick) === "lost"),
  };
  const shown = lists[filter];
  const staked = shown.reduce((sum, pick) => sum + pick.coinsBet, 0);
  const net = shown.reduce((sum, pick) => sum + pickNet(pick), 0);
  const label = withAlpha(accentVar("lime"), 0.9);
  const fill = `color-mix(in srgb, var(--ds-color-background-secondary) 86%, var(--ds-color-background-elevated))`;

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="PICKS" labelColor={label} fill={fill}>
          {formatInt(shown.length)}
        </StatCell>
        <StatCell label="STAKED" labelColor={label} fill={fill}>
          {formatOzCompact(staked)}
        </StatCell>
        <StatCell
          label="NET"
          labelColor={label}
          fill={fill}
          valueColor={
            net > 0
              ? "var(--ds-color-success)"
              : net < 0
                ? "var(--ds-color-danger)"
                : undefined
          }
        >
          {formatChange(net)}
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
          {shown.map((pick) => (
            <PickEntry key={pick._id} pick={pick} />
          ))}
        </ul>
      ) : (
        <HistoryEmpty
          message={all.length ? "NO PICKS MATCH THIS FILTER" : "NO MATCH PICKS YET"}
        />
      )}
    </div>
  );
}
