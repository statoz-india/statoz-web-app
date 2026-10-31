"use client";

import { useState, type ReactNode } from "react";

import type { Sport } from "@/config/sports";
import { useTodayInIST } from "@/hooks/useTodayInIST";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EventBusyIcon,
} from "@/lib/icons";

import { CardGridSkeleton, FeedEmpty, FeedError } from "../components/feed-states";
import styles from "../css/SportsMatchFeed.module.css";
import {
  useSportsMatches,
  useSportsMatchesByDays,
} from "../data/getSportsMatch.data";
import { SportsMatchWidget } from "../widgets/sportsMatch.widget";

const DAY_MS = 86_400_000;

/** The earliest day the navigator and the date picker reach back to. */
const EARLIEST_DAY = "2026-03-28";

/** How far the navigator reaches ahead of today, or of this week for racing. */
const DAYS_AHEAD = 7;
const WEEKS_AHEAD = 4;

/**
 * One sport's fixtures, one block per league. Team sports go a day at a time;
 * racing goes a week at a time, Monday to Sunday, because a race weekend is
 * the unit there. A day is a calendar day in India time, which is how the API
 * files a fixture.
 */
export function SportsMatchFeed({ sport }: { sport: Sport }) {
  const today = useTodayInIST();
  // Which day is "today" is only known in the browser.
  if (today === null) return <CardGridSkeleton />;
  return sport === "racing" ? (
    <WeekFeed today={today} />
  ) : (
    <DayFeed sport={sport} today={today} />
  );
}

function WeekFeed({ today }: { today: string }) {
  const thisWeek = mondayOf(today);
  // The week holding the earliest day, so that day can still be opened.
  const first = mondayOf(EARLIEST_DAY);
  const last = shiftDay(thisWeek, 7 * WEEKS_AHEAD);
  const [week, setWeek] = useState(thisWeek);
  const days = Array.from({ length: 7 }, (_, offset) => shiftDay(week, offset));
  const { resources, reload } = useSportsMatchesByDays("racing", days);

  const loading = resources.some((resource) => resource.status === "loading");
  const failure = resources.find(
    (resource) => resource.status === "error" && resource.data === undefined,
  );
  const raceDays = days
    .map((day, index) => ({ day, sections: resources[index]?.data ?? [] }))
    .filter(({ sections }) => sections.some((section) => section.matches.length));
  const count =
    loading || failure
      ? null
      : raceDays
          .flatMap(({ sections }) => sections)
          .reduce((total, section) => total + section.matches.length, 0);

  /** A picked date opens its week; outside the range it lands on the nearest end. */
  function pick(value: string) {
    if (!value) return;
    const monday = mondayOf(value);
    setWeek(monday < first ? first : monday > last ? last : monday);
  }

  function content() {
    if (loading) return <CardGridSkeleton />;
    if (failure) {
      return (
        <FeedError
          subject="racing fixtures"
          error={failure.error}
          onRetry={reload}
        />
      );
    }
    if (raceDays.length === 0) {
      return (
        <FeedEmpty
          icon={<EventBusyIcon size={34} className="text-cyan" />}
          title="NO RACES THIS WEEK"
          note="Pick another race week to find open predictions."
        />
      );
    }
    return (
      <div className="flex flex-col gap-5">
        {raceDays.map(({ day, sections }) => (
          <section key={day} aria-label={formatMonthDay(day)}>
            <h2 className="mb-4 mt-2 text-center font-display text-sm font-black tracking-display text-cyan">
              {formatMonthDay(day)}
            </h2>
            {sections.map((section) => (
              <SportsMatchWidget
                key={`${day}/${section.tournament}`}
                section={section}
              />
            ))}
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <MatchDayNavigator
        label={weekHeading(week, thisWeek)}
        count={count}
        canPrevious={week > first}
        canNext={week < last}
        onPrevious={() => setWeek(shiftDay(week, -7))}
        onNext={() => setWeek(shiftDay(week, 7))}
        dateValue={week}
        dateMin={EARLIEST_DAY}
        dateMax={shiftDay(last, 6)}
        weekMode
        onDateChange={pick}
      />
      {content()}
    </div>
  );
}

function DayFeed({ sport, today }: { sport: Sport; today: string }) {
  const [day, setDay] = useState(today);
  const first = EARLIEST_DAY;
  const last = shiftDay(today, DAYS_AHEAD);
  const fixtures = useSportsMatches(sport, day);
  const sections = fixtures.data ?? [];
  const count = fixtures.data
    ? sections.reduce((total, section) => total + section.matches.length, 0)
    : null;

  /** A picked date outside the range lands on its nearest end. */
  function pick(value: string) {
    if (!value) return;
    setDay(value < first ? first : value > last ? last : value);
  }

  function content() {
    if (!fixtures.data) {
      return fixtures.status === "error" ? (
        <FeedError
          subject={`${sport} fixtures`}
          error={fixtures.error}
          onRetry={fixtures.reload}
        />
      ) : (
        <CardGridSkeleton />
      );
    }
    if (count === 0) {
      return (
        <FeedEmpty
          icon={<EventBusyIcon size={34} className="text-cyan" />}
          title={`NO GAMES ON ${formatMonthDay(day)}`}
          note="Pick another match day to find open predictions."
        />
      );
    }
    // Adjacent league blocks space themselves 20px apart. Keyed by day too, so
    // a league opened with "View more" starts collapsed again on another day.
    return (
      <div>
        {sections.map((section) => (
          <SportsMatchWidget
            key={`${day}/${section.tournament}`}
            section={section}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <MatchDayNavigator
        label={dayHeading(day, today)}
        count={count}
        canPrevious={day > first}
        canNext={day < last}
        onPrevious={() => setDay(shiftDay(day, -1))}
        onNext={() => setDay(shiftDay(day, 1))}
        dateValue={day}
        dateMin={first}
        dateMax={last}
        weekMode={false}
        onDateChange={pick}
      />
      {content()}
    </div>
  );
}

/*
 * Calendar arithmetic on YYYY-MM-DD keys. A key is read at UTC midnight only
 * so that adding days to it cannot cross a clock change.
 */
function shiftDay(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** The Monday of the week a day key falls in. */
function mondayOf(key: string): string {
  const weekday = new Date(`${key}T00:00:00.000Z`).getUTCDay();
  return shiftDay(key, weekday === 0 ? -6 : 1 - weekday);
}

function weekHeading(week: string, thisWeek: string): string {
  if (week === thisWeek) return "THIS WEEK";
  if (week === shiftDay(thisWeek, 7)) return "NEXT WEEK";
  if (week === shiftDay(thisWeek, -7)) return "LAST WEEK";
  return `${formatMonthDay(week)} — ${formatMonthDay(shiftDay(week, 6))}`;
}

function dayHeading(key: string, today: string): string {
  if (key === today) return "TODAY";
  if (key === shiftDay(today, 1)) return "TOMORROW";
  if (key === shiftDay(today, -1)) return "YESTERDAY";
  return formatMonthDay(key);
}

/** A day key's date, for example "26 AUG". */
function formatMonthDay(key: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${key}T00:00:00.000Z`))
    .toUpperCase();
}

export type MatchDayNavigatorProps = {
  label: string;
  /** Null until the whole period has loaded. */
  count: number | null;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  dateValue: string;
  dateMin: string;
  dateMax: string;
  weekMode: boolean;
  onDateChange: (value: string) => void;
};

/** The day (or race week) bar: previous, the period and its count, a date picker, and next. */
export function MatchDayNavigator({
  label,
  count,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  dateValue,
  dateMin,
  dateMax,
  weekMode,
  onDateChange,
}: MatchDayNavigatorProps) {
  return (
    <div className="flex min-h-11 items-center justify-center">
      <NavigatorButton
        label={weekMode ? "Previous race week" : "Previous match day"}
        enabled={canPrevious}
        onClick={onPrevious}
      >
        <ChevronLeftIcon size={23} />
      </NavigatorButton>
      <div
        className="flex min-w-0 max-w-68 flex-1 items-center justify-center px-2"
        aria-live="polite"
      >
        <span className="truncate font-display text-sm font-black tracking-display">
          {label}
        </span>
        {count === null ? null : (
          <span className="ds-tabular ml-1.5 shrink-0 font-display text-sm font-extrabold text-muted">
            ({count})
          </span>
        )}
        <span
          className={`${styles.datePicker} relative ml-1 grid size-11 shrink-0 place-items-center text-muted`}
          title={weekMode ? "Pick race week" : "Pick match day"}
        >
          <CalendarIcon size={18} />
          <input
            type="date"
            aria-label={weekMode ? "Pick race week" : "Pick match day"}
            value={dateValue}
            min={dateMin}
            max={dateMax}
            onChange={(event) => onDateChange(event.target.value)}
            // The input is invisible over the icon, and a click on its body alone
            // does not open the calendar in every browser.
            onClick={(event) => {
              try {
                event.currentTarget.showPicker();
              } catch {
                // Not supported here; the browser's own behaviour still applies.
              }
            }}
            className={styles.dateInput}
          />
        </span>
      </div>
      <NavigatorButton
        label={weekMode ? "Next race week" : "Next match day"}
        enabled={canNext}
        onClick={onNext}
      >
        <ChevronRightIcon size={23} />
      </NavigatorButton>
    </div>
  );
}

function NavigatorButton({
  label,
  enabled,
  onClick,
  children,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!enabled}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center text-cyan transition-colors disabled:text-muted/35"
    >
      {children}
    </button>
  );
}
