"use client";

import { useState, type ReactNode } from "react";

import { accentVar } from "@/styles";
import {
  QuizIcon,
  ScheduleIcon,
  SignalOffIcon,
  TrendingUpIcon,
} from "@/lib/icons";
import { NoDataState } from "@/lib/ui/no-data-state";
import type { Event, Prediction } from "@/core";
import type { Sport } from "@/config/sports";
import { useRequireAuth } from "@/features/auth";
import { useMatchEvents } from "@/features/events/data/getMatchEvent";
import { TrendingEventWidget } from "@/features/events/widgets/trendingEvent.widget";
import { FeedError } from "@/features/homescreen/components/feed-states";
import { useMatchPredictions } from "@/features/predictions/data/getMatchPrediction";
import { TrendingPredictionsWidget } from "@/features/predictions/widgets/trendingPredictions.widget";
import { useMatchQuizzes } from "@/features/quizzes/data/getMatchQuiz";
import {
  isShownQuiz,
  MatchQuizCard,
  QuizCardList,
} from "@/features/quizzes/widgets/quizCard";

import type { MatchDetailScoreboard, SportMatch } from "../types";

import styles from "../css/match-detail.module.css";
import { UnderlineTabs } from "@/lib/components/underline-tabs";
import { MatchScoreboard } from "./match-stats/match-scoreboard";

/**
 * The match surfaces: the quizzes, the markets on the same fixture, and the
 * scoreboard. Only the scoreboard has an API behind it so far, so it is the
 * tab the page opens on and the other two say they are on the way.
 */

type MainTab = "predict" | "picks" | "stats";

/** Labels only — the underline is the whole signal. */
const mainTabs: { id: MainTab; label: string }[] = [
  { id: "predict", label: "PREDICT" },
  { id: "picks", label: "PICKS" },
  { id: "stats", label: "STATS" },
];

export type MatchTabsViewProps = {
  match: SportMatch;
  /** Missing while the match has no stats to report. */
  scoreboard?: MatchDetailScoreboard;
  /** True while the stats are on their way for the first time. */
  statsLoading?: boolean;
  /** What to show in place of the stats when they could not be fetched. */
  statsFailure?: ReactNode;
};

export function MatchTabsView({
  match,
  scoreboard,
  statsLoading = false,
  statsFailure,
}: MatchTabsViewProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("stats");
  const activeIndex = mainTabs.findIndex((tab) => tab.id === activeTab);

  return (
    <section className={styles.tabsBody} aria-label="Match content">
      <UnderlineTabs
        label="Match detail tabs"
        className={styles.mainTabs}
        tabs={mainTabs}
        activeIndex={activeIndex}
        onChange={(index) => setActiveTab(mainTabs[index].id)}
        accent={accentVar("cyan")}
      />

      <div className={styles.tabPanel}>
        {activeTab === "predict" ? <PredictPanel matchId={match.id} /> : null}
        {activeTab === "picks" ? (
          <PicksPanel matchId={match.id} sport={match.sport} />
        ) : null}
        {activeTab === "stats" ? (
          scoreboard ? (
            <MatchScoreboard match={match} scoreboard={scoreboard} />
          ) : statsLoading ? (
            <div className={styles.scrollPanel}>
              <div
                role="status"
                aria-label="Loading stats"
                className="m-4 h-40 animate-pulse bg-surface-elevated/50"
              />
            </div>
          ) : statsFailure ? (
            <div className={`${styles.scrollPanel} p-4`}>{statsFailure}</div>
          ) : (
            <div className={styles.scrollPanel}>
              <NoDataState
                icon={SignalOffIcon}
                title="No stats yet"
                message={
                  match.status === "scheduled"
                    ? match.sport === "racing"
                      ? "Stats start arriving once the race is under way."
                      : "Stats start arriving once the match starts."
                    : "There are no stats to show yet."
                }
              />
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}

/** The match's quizzes. Loaded the first time the tab opens. */
function PredictPanel({ matchId }: { matchId: string }) {
  const quizzes = useMatchQuizzes(matchId);

  if (!quizzes.data) {
    return quizzes.status === "error" ? (
      <div className={`${styles.scrollPanel} p-4`}>
        <FeedError
          subject="this match's quizzes"
          error={quizzes.error}
          onRetry={quizzes.reload}
        />
      </div>
    ) : (
      <div className={styles.scrollPanel}>
        <div
          role="status"
          aria-label="Loading quizzes"
          className="m-4 h-40 animate-pulse bg-surface-elevated/50"
        />
      </div>
    );
  }

  const shown = quizzes.data.filter(isShownQuiz);
  if (shown.length === 0) {
    return (
      <ComingSoon
        icon={QuizIcon}
        title="No quizzes yet"
        message="Call the score and the big moments of this match, and earn XP for every one you get right."
      />
    );
  }
  return (
    <div className={styles.scrollPanel}>
      <QuizCardList>
        {shown.map((quiz, i) => (
          <MatchQuizCard key={quiz._id} quiz={quiz} index={i + 1} />
        ))}
      </QuizCardList>
    </div>
  );
}

/** Whether players see a prediction at all. */
function isShownPrediction(prediction: Prediction): boolean {
  return (
    prediction.isVisible &&
    prediction.predictionStatus !== "NOT_VISIBLE" &&
    prediction.predictionStatus !== "ADMIN_VISIBLE"
  );
}

/** Whether the events panel lists an event at all. */
function isShownEvent(event: Event): boolean {
  return event.eventStatus !== "DELETED";
}

/**
 * The match's pick markets, then its events. Both are loaded the first time
 * the tab opens.
 */
function PicksPanel({ matchId, sport }: { matchId: string; sport: Sport }) {
  const predictions = useMatchPredictions(matchId);
  const events = useMatchEvents(matchId);
  const requireAuth = useRequireAuth();

  const failed = [
    { subject: "this match's picks", resource: predictions },
    { subject: "this match's events", resource: events },
  ].find(({ resource }) => !resource.data && resource.status === "error");
  if (failed) {
    return (
      <div className={`${styles.scrollPanel} p-4`}>
        <FeedError
          subject={failed.subject}
          error={failed.resource.error}
          onRetry={failed.resource.reload}
        />
      </div>
    );
  }

  if (!predictions.data || !events.data) {
    return (
      <div className={styles.scrollPanel}>
        <div
          role="status"
          aria-label="Loading picks"
          className="m-4 h-40 animate-pulse bg-surface-elevated/50"
        />
      </div>
    );
  }

  const shown = predictions.data.filter(isShownPrediction);
  const shownEvents = events.data.filter(isShownEvent);
  if (shown.length === 0 && shownEvents.length === 0) {
    return (
      <ComingSoon
        icon={TrendingUpIcon}
        title="No picks yet"
        message="This match's markets will open here."
      />
    );
  }
  return (
    <div className={styles.scrollPanel}>
      <div className="grid grid-cols-1 gap-4">
        {shown.map((prediction) => (
          <TrendingPredictionsWidget
            key={prediction._id}
            prediction={prediction}
            // There is no trade sheet yet, so a signed-in player's tap does nothing.
            onPick={() => requireAuth({ intent: "lock a pick" })}
            guard={() => requireAuth({ intent: "lock a pick" })}
          />
        ))}
        <TrendingEventWidget
          sport={sport}
          events={shownEvents}
          showAll
          guard={() => requireAuth({ intent: "lock a pick" })}
        />
      </div>
    </div>
  );
}

function ComingSoon({
  icon,
  title,
  message,
}: {
  icon: typeof QuizIcon;
  title: string;
  message: string;
}) {
  return (
    <div className={styles.scrollPanel}>
      <NoDataState
        icon={icon}
        spark={ScheduleIcon}
        title={title}
        message={message}
      />
    </div>
  );
}
