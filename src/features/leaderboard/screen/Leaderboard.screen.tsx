"use client";

import { useState } from "react";

import { isSport, type Sport } from "@/config/sports";
import { SportHubTabs } from "@/features/homescreen/components/sport-hub-tabs";
import { SignalOffIcon, TrophyIcon } from "@/lib/icons";
import { NoDataState } from "@/lib/ui/no-data-state";

import {
  useLeaderboardSports,
  useSportLeaderboard,
} from "../data/getLeaderboard.data";
import { LeaderboardWidget } from "../widgets/leaderboard.widget";

/**
 * The leaderboard: one tab per sport the API covers, and that sport's board
 * under it. Each board loads the first time its tab opens.
 */
export function LeaderboardScreen() {
  const sports = useLeaderboardSports();
  // `null` until a tab is picked; the first sport shows until then.
  const [picked, setPicked] = useState<Sport | null>(null);
  // Only sports this app knows how to show, in the API's order.
  const list = (sports.data ?? [])
    .map((sport) => sport.sportsType.toLowerCase())
    .filter(isSport);
  const selected = picked !== null && list.includes(picked) ? picked : list[0];

  return (
    <div className="mx-auto flex w-full flex-col py-3">
      {!sports.data ? (
        sports.status === "error" ? (
          <NoDataState
            icon={SignalOffIcon}
            title="Couldn't load the sports"
            message="Check your connection and try again."
            action={<RetryButton onClick={sports.reload} />}
          />
        ) : (
          <Skeleton label="Loading sports" />
        )
      ) : selected === undefined ? (
        <NoDataState
          icon={TrophyIcon}
          title="No leaderboards yet"
          message="Check back soon."
        />
      ) : (
        <>
          <SportHubTabs
            destinations={list}
            selected={selected}
            onSelect={(tab) => {
              if (isSport(tab)) setPicked(tab);
            }}
          />
          {/* Keyed so a new sport starts from a fresh board. */}
          <SportBoard key={selected} gameType={selected} />
        </>
      )}
    </div>
  );
}

function SportBoard({ gameType }: { gameType: string }) {
  const board = useSportLeaderboard(gameType);

  if (board.data === undefined) {
    return board.status === "error" ? (
      <NoDataState
        icon={SignalOffIcon}
        title="Couldn't load the leaderboard"
        message="Check your connection and try again."
        action={<RetryButton onClick={board.reload} />}
      />
    ) : (
      <Skeleton label="Loading leaderboard" />
    );
  }
  if (!board.data || board.data.leaderboard.length === 0) {
    return (
      <NoDataState
        icon={TrophyIcon}
        title="No players yet"
        message={`Make a ${gameType} prediction to get on the board.`}
      />
    );
  }
  return <LeaderboardWidget entries={board.data.leaderboard} />;
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center bg-cyan/12 px-5 font-display text-xs font-bold tracking-wide text-cyan transition-colors duration-200 hover:bg-cyan/20"
    >
      TRY AGAIN
    </button>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="mt-4 h-40 animate-pulse bg-surface-elevated/50"
    />
  );
}
