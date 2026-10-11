"use client";

import { useState, type ReactNode } from "react";

import {
  QuizIcon,
  ScheduleIcon,
  SignalOffIcon,
  TrendingUpIcon,
  accentVar,
} from "@/utils";
import { NoDataState } from "@/widgets/ui/components/no-data-state";
import { UnderlineTabs } from "@/widgets/ui/components/underline-tabs";

import type { MatchDetailScoreboard, SportMatch } from "../types";
import { MatchScoreboard } from "./match-scoreboard";
import styles from "./match-detail.module.css";

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
        {activeTab === "predict" ? (
          <ComingSoon
            icon={QuizIcon}
            title="Predictions are coming soon"
            message="Call the score and the big moments of this match, and earn XP for every one you get right."
          />
        ) : null}
        {activeTab === "picks" ? (
          <ComingSoon
            icon={TrendingUpIcon}
            title="Picks are coming soon"
            message="This match's markets will open here."
          />
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
