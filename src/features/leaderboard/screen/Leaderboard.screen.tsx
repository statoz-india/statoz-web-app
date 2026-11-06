"use client";

import { useState } from "react";

import { isSport, type Sport } from "@/config/sports";
import { useAuthSession } from "@/features/auth";
import { SportHubTabs } from "@/features/homescreen/components/sport-hub-tabs";
import { FilterChips } from "@/lib/components/filter-chips";
import { SignalOffIcon, TrophyIcon } from "@/lib/icons";
import { NoDataState } from "@/lib/ui/no-data-state";

import { sportRow, tournamentRow, type BoardRow } from "../adapters";
import {
  useLeaderboardSports,
  useSportLeaderboard,
  useLeaderboardTournaments,
  useTournamentLeaderboard,
} from "../data/getLeaderboard.data";
import { LeaderboardWidget } from "../widgets/leaderboard.widget";

/**
 * The leaderboard: one tab per sport the API covers, and that sport's board
 * under it, or one of its tournaments'. Each board loads the first time it opens.
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

const ALL = "ALL";

/**
 * A sport's board, with a chip per tournament under the tabs. Tournament
 * boards need an account, so a guest sees the sport-wide board only.
 */
function SportBoard({ gameType }: { gameType: string }) {
  const { status } = useAuthSession();
  const tournaments = useLeaderboardTournaments(gameType, status === "authenticated");
  const [picked, setPicked] = useState(ALL);
  // In the API's order: most players first.
  const codes = tournaments.data?.tournaments.map((t) => t.tournament) ?? [];
  const selected = codes.includes(picked) ? picked : ALL;

  return (
    <>
      {codes.length > 0 && (
        <FilterChips
          options={[ALL, ...codes]}
          selected={selected}
          onSelect={setPicked}
          label="Tournament"
          className="py-1"
        />
      )}
      {selected === ALL ? (
        <WholeSportBoard gameType={gameType} />
      ) : (
        <TournamentBoard key={selected} tournament={selected} />
      )}
    </>
  );
}

function WholeSportBoard({ gameType }: { gameType: string }) {
  const board = useSportLeaderboard(gameType);
  return (
    <Board
      status={board.status}
      // `null` when the API has no board for the sport.
      rows={board.data === undefined ? undefined : (board.data?.leaderboard.map(sportRow) ?? [])}
      onRetry={board.reload}
      emptyMessage={`Make a ${gameType} prediction to get on the board.`}
    />
  );
}

function TournamentBoard({ tournament }: { tournament: string }) {
  const board = useTournamentLeaderboard(tournament);
  return (
    <Board
      status={board.status}
      rows={board.data?.leaderboard.map(tournamentRow)}
      onRetry={board.reload}
      emptyMessage={`Play a ${tournament} match quiz to get on the board.`}
    />
  );
}

/** A board once it loads, with its loading, failed and empty states. */
function Board({
  status,
  rows,
  onRetry,
  emptyMessage,
}: {
  status: "loading" | "ready" | "error";
  rows: BoardRow[] | undefined;
  onRetry: () => void;
  emptyMessage: string;
}) {
  if (rows === undefined) {
    return status === "error" ? (
      <NoDataState
        icon={SignalOffIcon}
        title="Couldn't load the leaderboard"
        message="Check your connection and try again."
        action={<RetryButton onClick={onRetry} />}
      />
    ) : (
      <Skeleton label="Loading leaderboard" />
    );
  }
  if (rows.length === 0) {
    return <NoDataState icon={TrophyIcon} title="No players yet" message={emptyMessage} />;
  }
  return <LeaderboardWidget entries={rows} />;
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
