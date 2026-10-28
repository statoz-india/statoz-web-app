"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo } from "react";

import type { MatchSport } from "@/config/sports";
import {
  FeedEmpty,
  FeedError,
} from "@/features/homescreen/components/feed-states";
import { useTodayInIST } from "@/hooks/useTodayInIST";
import { ArrowLeftIcon, SignalOffIcon } from "@/lib/icons";

import {
  findFixture,
  isRace,
  toMatch,
  toRaceMatch,
  toScoreboard,
} from "../adapters";
import styles from "../components/match-detail.module.css";
import { MatchSummaryHeader } from "../components/match-summary-header";
import { MatchTabsView } from "../components/match-tabs-view";
import {
  loadedMatchDay,
  rememberMatchDay,
  shiftDay,
  useKnownMatchDay,
} from "../match-day";
import { useFixtureDays, useMatchStats } from "../queries";

/** The public API asks not to be polled faster than this. */
const POLL_MS = 30_000;

/** The sports whose day lists a match or a race can be found in. */
const FIXTURE_SPORTS: MatchSport[] = [
  "football",
  "cricket",
  "basketball",
  "racing",
];

/**
 * The days searched for a match nothing here knows the day of: a link opened
 * in a browser that has never seen the match. Each day costs a request per
 * sport, and the API allows 60 a minute, so it is yesterday and tomorrow only.
 */
const NEARBY_DAYS = [-1, 1];

/**
 * One match: its header and its tabs, across the full width of the page.
 *
 * Below 1024px the page covers the whole screen, the app's navigation
 * included, so it carries its own way back.
 */
export default function MatchScreen() {
  const params = useParams<{ id: string }>();
  const matchId = readableId(params.id);
  const knownDay = useKnownMatchDay(matchId);
  const today = useTodayInIST();

  // The address is the match's id alone, and matches are listed by day. The
  // day is the one already known for this match, and failing that today.
  const day = knownDay ?? today;
  const days = useMemo(
    () => (day ? FIXTURE_SPORTS.map((sport) => ({ sport, day })) : []),
    [day],
  );
  const listed = useFixtureDays(days);
  const listedLoading =
    day === null ||
    listed.resources.some((resource) => resource.status === "loading");
  const onDay = findFixture(
    listed.resources.map((resource) => resource.data),
    matchId,
  );

  // Not there: look a day either side of today before giving up.
  const widen = !onDay && !listedLoading && today !== null;
  const nearbyDays = useMemo(
    () =>
      widen && today
        ? NEARBY_DAYS.map((offset) => shiftDay(today, offset))
            .filter((nearby) => nearby !== day)
            .flatMap((nearby) =>
              FIXTURE_SPORTS.map((sport) => ({ sport, day: nearby })),
            )
        : [],
    [widen, today, day],
  );
  const nearby = useFixtureDays(nearbyDays);
  const fixture =
    onDay ??
    findFixture(
      nearby.resources.map((resource) => resource.data),
      matchId,
    );

  // Once found, the day is kept, so a reload goes straight to it.
  const found = fixture !== undefined;
  useEffect(() => {
    if (!found) return;
    const foundOn = loadedMatchDay(matchId);
    if (foundOn) rememberMatchDay(matchId, foundOn);
  }, [found, matchId]);

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

  const lookups = [...listed.resources, ...nearby.resources];
  const lookingUp =
    !fixture &&
    (listedLoading ||
      nearby.resources.some((resource) => resource.status === "loading"));
  const lookupFailure = lookups.find((resource) => resource.status === "error");

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
            ) : lookupFailure ? (
              <FeedError
                subject="this match"
                error={lookupFailure.error}
                onRetry={() => {
                  listed.reload();
                  nearby.reload();
                }}
              />
            ) : (
              <FeedEmpty
                icon={<SignalOffIcon size={34} className="text-cyan" />}
                title="MATCH NOT AVAILABLE"
                note={`No match called ${matchId} is on the fixture lists for yesterday, today or tomorrow.`}
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
