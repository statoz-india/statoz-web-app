"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo } from "react";

import { isSport } from "@/config/sports";
import {
  FeedEmpty,
  FeedError,
} from "@/features/homescreen/components/feed-states";
import { ArrowLeftIcon, SignalOffIcon } from "@/lib/icons";

import { isRace, toMatch, toRaceMatch, toScoreboard } from "../adapters";
import styles from "../css/match-detail.module.css";
import { MatchSummaryHeader } from "../components/match-stats/match-summary-header";
import { MatchTabsView } from "../components/match-tabs-view";
import { useFixture, useMatchStats } from "../data/match.data";

/** The public API asks not to be polled faster than this. */
const POLL_MS = 30_000;

/**
 * One match: its header and its tabs, across the full width of the page.
 *
 * Below 1024px the page covers the whole screen, the app's navigation
 * included, so it carries its own way back.
 */
export default function MatchScreen() {
  const params = useParams<{ id: string }>();
  const matchId = readableId(params.id);
  // An unknown sport counts as none, which tries a match and then a race.
  const sportParam = useSearchParams().get("sport")?.toLowerCase();
  const lookup = useFixture(matchId, isSport(sportParam) ? sportParam : null);
  const fixture = lookup.data ?? undefined;

  const stats = useMatchStats(fixture);
  const record = stats.data;

  const match = !fixture
    ? null
    : isRace(fixture)
      ? toRaceMatch(matchId, record, fixture)
      : toMatch(matchId, record, fixture);
  const scoreboard = useMemo(
    () => toScoreboard(matchId, record),
    [matchId, record],
  );

  // A match in play is read again every 30 seconds, and left alone once over.
  const live = match?.status === "live";
  const poll = useEffectEvent(() => {
    if (document.visibilityState === "visible") stats.refresh();
  });
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(poll, POLL_MS);
    return () => window.clearInterval(timer);
  }, [live]);

  const lookingUp = !fixture && lookup.status === "loading";

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <BackBar />
        {match ? (
          <>
            <MatchSummaryHeader match={match} />
            <MatchTabsView
              key={matchId}
              match={match}
              scoreboard={scoreboard}
              statsLoading={stats.status === "loading"}
              statsFailure={
                stats.status === "error" && record === undefined ? (
                  <FeedError
                    subject="this match's stats"
                    error={stats.error}
                    onRetry={stats.reload}
                  />
                ) : undefined
              }
            />
          </>
        ) : (
          <div className="p-4 lg:col-span-full">
            {lookingUp ? (
              <div
                role="status"
                aria-label="Loading match"
                className="h-40 animate-pulse bg-surface-elevated/50"
              />
            ) : lookup.status === "error" ? (
              <FeedError
                subject="this match"
                error={lookup.error}
                onRetry={lookup.reload}
              />
            ) : (
              <FeedEmpty
                icon={<SignalOffIcon size={34} className="text-cyan" />}
                title="MATCH NOT AVAILABLE"
                note={`There's no match called ${matchId}.`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** The id as it was written, whether or not the router has decoded it. */
function readableId(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function BackBar() {
  const router = useRouter();
  return (
    <div className={styles.backBar}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => {
          // Opened directly, there is no page to go back to.
          if (window.history.length > 1) router.back();
          else router.push("/");
        }}
      >
        <ArrowLeftIcon size={16} />
        BACK
      </button>
    </div>
  );
}
