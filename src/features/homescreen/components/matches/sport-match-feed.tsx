"use client";

import Link from "next/link";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useRef, useState } from "react";

import { sportModuleFor, type MatchSport } from "@/config/sports";
import { useTodayInIST } from "@/hooks/useTodayInIST";
import { colors, liftForContrast } from "@/styles";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EventBusyIcon,
} from "@/lib/icons";

import { toLeagueGroups } from "../../adapters";
import { useDayFixtures } from "../../queries";
import type { LeagueGroup } from "../../types";
import { CardGridSkeleton, FeedError } from "../feed-states";
import { SportFixtureCard } from "./sport-fixture-card";
import styles from "./sport-match-feed.module.css";

const DAY_MS = 86_400_000;
const PREVIEW_COUNT = 3;

/** How far the navigator reaches either side of today. */
const DAYS_BACK = 7;
const DAYS_AHEAD = 7;
const WEEKS_BACK = 2;
const WEEKS_AHEAD = 4;

/**
 * One sport's fixtures, a day at a time. Motorsport is listed a week at a
 * time instead, Monday to Sunday, because a race weekend is the unit there.
 *
 * A day is a calendar day in India time, which is how the API files a fixture.
 */
export function SportMatchFeed({ sport }: { sport: MatchSport }) {
  const today = useTodayInIST();
  // Which day is "today" is only known in the browser.
  if (today === null) return <CardGridSkeleton />;
  return <DatedFeed sport={sport} today={today} />;
}

function DatedFeed({ sport, today }: { sport: MatchSport; today: string }) {
  const weekMode = sport === "racing";
  const periods = weekMode ? weeksAround(today) : daysAround(today);
  const [selectedPeriod, setSelectedPeriod] = useState(() =>
    weekMode ? dateKey(mondayOf(fromDateKey(today))) : today,
  );
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [expanded, setExpanded] = useState<string[]>([]);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const currentIndex = Math.max(0, periods.indexOf(selectedPeriod));
  const selectedStart = fromDateKey(selectedPeriod);
  const days = weekMode
    ? Array.from({ length: 7 }, (_, offset) =>
        dateKey(addDays(selectedStart, offset)),
      )
    : [selectedPeriod];
  const { resources, reload } = useDayFixtures(sport, days);

  const loading = resources.some((resource) => resource.status === "loading");
  const failure = resources.find(
    (resource) => resource.status === "error" && resource.data === undefined,
  );
  const groupedDays = days
    .map((day, index): [string, LeagueGroup[]] => [
      day,
      toLeagueGroups(resources[index].data ?? []),
    ])
    .filter(([, groups]) => groups.length > 0);
  const count = groupedDays
    .flatMap(([, groups]) => groups)
    .reduce((sum, group) => sum + group.fixtures.length, 0);

  function move(delta: number) {
    const next = periods[currentIndex + delta];
    if (!next) return;
    setDirection(delta < 0 ? "right" : "left");
    setSelectedPeriod(next);
  }

  function selectDate(value: string) {
    if (!value) return;
    const normalized = weekMode ? dateKey(mondayOf(fromDateKey(value))) : value;
    const next = periods.includes(normalized)
      ? normalized
      : closestPeriod(periods, normalized);
    setDirection(next < selectedPeriod ? "right" : "left");
    setSelectedPeriod(next);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) < 80 || Math.abs(x) <= Math.abs(y)) return;
    move(x < 0 ? 1 : -1);
  }

  return (
    <div
      className={`${styles.feed} mx-auto w-full max-w-6xl`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <MatchDayNavigator
        label={
          weekMode
            ? weekHeading(selectedStart, today)
            : dayHeading(selectedStart, today)
        }
        count={loading || failure ? null : count}
        canPrevious={currentIndex > 0}
        canNext={currentIndex < periods.length - 1}
        onPrevious={() => move(-1)}
        onNext={() => move(1)}
        dateValue={selectedPeriod}
        dateMin={periods[0]}
        dateMax={dateKey(
          addDays(fromDateKey(periods.at(-1)!), weekMode ? 6 : 0),
        )}
        weekMode={weekMode}
        onDateChange={selectDate}
      />

      <div
        key={`${sport}-${selectedPeriod}`}
        className="mt-3 flex flex-col gap-5"
      >
        {loading ? (
          <CardGridSkeleton />
        ) : (
          <>
            {groupedDays.map(([day, groups]) => (
              <DayGroup
                key={day}
                day={day}
                groups={groups}
                showDate={weekMode}
                direction={direction}
                expanded={expanded}
                onExpand={(id) => setExpanded((ids) => [...ids, id])}
              />
            ))}
            {failure ? (
              <FeedError
                subject={`${sportModuleFor(sport).label.toLowerCase()} fixtures`}
                error={failure.error}
                onRetry={reload}
              />
            ) : groupedDays.length === 0 ? (
              <EmptyPeriod date={selectedStart} weekMode={weekMode} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function MatchDayNavigator({
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
}: {
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
}) {
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

function DayGroup({
  day,
  groups,
  showDate,
  direction,
  expanded,
  onExpand,
}: {
  day: string;
  groups: LeagueGroup[];
  showDate: boolean;
  direction: "left" | "right";
  /** The leagues whose every fixture is shown, as `day/league` ids. */
  expanded: string[];
  onExpand: (id: string) => void;
}) {
  const heading = formatMonthDay(fromDateKey(day));
  let animationIndex = 0;
  return (
    <section aria-label={heading}>
      {showDate ? (
        <h2 className="mb-4 mt-2 text-center font-display text-sm font-black tracking-display text-cyan">
          {heading}
        </h2>
      ) : null}
      <div className="flex flex-col gap-5">
        {groups.map((league) => {
          const sectionId = `${day}/${league.id}`;
          const visible = expanded.includes(sectionId)
            ? league.fixtures
            : league.fixtures.slice(0, PREVIEW_COUNT);
          const remaining = league.fixtures.length - visible.length;
          const headingId = `league-${sectionId}`;
          const accent = league.accent ?? "var(--ds-color-accent-cyan)";
          return (
            <section key={league.id} aria-labelledby={headingId}>
              <Link
                href={`/leagues/${encodeURIComponent(league.id)}`}
                className="mb-2 flex min-h-11 items-center gap-2.5 no-underline"
              >
                <h3
                  id={headingId}
                  className="ds-tabular shrink-0 font-display text-lg font-black tracking-mega text-cyan/85"
                >
                  {league.shortCode}
                </h3>
                <span
                  aria-hidden
                  className="h-px flex-1"
                  style={{
                    background: `color-mix(in srgb, ${accent} 25%, transparent)`,
                  }}
                />
                <span className="shrink-0 font-display text-2xs font-extrabold tracking-ultra text-muted">
                  STANDING
                </span>
                <ChevronRightIcon size={13} className="shrink-0 text-cyan/70" />
              </Link>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((match) => {
                  const index = animationIndex++;
                  return (
                    <li
                      key={match.id}
                      className={styles.cardEnter}
                      style={
                        {
                          "--fixture-index": index,
                          "--fixture-shift":
                            direction === "left" ? "-16px" : "16px",
                        } as CSSProperties
                      }
                    >
                      <SportFixtureCard match={match} />
                    </li>
                  );
                })}
              </ul>
              {remaining > 0 ? (
                <button
                  type="button"
                  onClick={() => onExpand(sectionId)}
                  className="ml-auto mt-2 flex min-h-11 items-center gap-1 font-display text-2xs font-black tracking-ultra"
                  // A league's own colour can be too dark to read as text.
                  style={{
                    color: liftForContrast(accent, {
                      against: colors.background.primary,
                      ratio: 4.5,
                    }),
                  }}
                  aria-label={`View ${remaining} more ${league.name} fixtures`}
                >
                  VIEW {remaining} MORE
                  <ChevronRightIcon size={14} />
                </button>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function EmptyPeriod({ date, weekMode }: { date: Date; weekMode: boolean }) {
  return (
    <div className="grid min-h-90 place-items-center text-center">
      <div className="flex max-w-sm flex-col items-center gap-3 text-muted">
        <EventBusyIcon size={34} className="text-cyan" />
        <p className="font-display text-sm font-black tracking-wide text-foreground">
          {weekMode
            ? "NO RACES THIS WEEK"
            : `NO GAMES ON ${formatMonthDay(date)}`}
        </p>
        <p className="text-sm leading-body">
          {weekMode
            ? "Swipe to another race week to find open predictions."
            : "Pick another match day to find open predictions."}
        </p>
        <CalendarIcon size={18} className="text-cyan/70" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Calendar arithmetic. A day key is a YYYY-MM-DD calendar date; it is held at
 * UTC midnight only so that adding days to it cannot cross a clock change.
 * ---------------------------------------------------------------------- */

function daysAround(today: string): string[] {
  const anchor = fromDateKey(today);
  return Array.from({ length: DAYS_BACK + DAYS_AHEAD + 1 }, (_, index) =>
    dateKey(addDays(anchor, index - DAYS_BACK)),
  );
}

function weeksAround(today: string): string[] {
  const anchor = mondayOf(fromDateKey(today));
  return Array.from({ length: WEEKS_BACK + WEEKS_AHEAD + 1 }, (_, index) =>
    dateKey(addDays(anchor, (index - WEEKS_BACK) * 7)),
  );
}

function closestPeriod(periods: string[], target: string): string {
  if (periods.length === 0) return target;
  const targetTime = fromDateKey(target).getTime();
  return periods.reduce((closest, candidate) => {
    const candidateDistance = Math.abs(
      fromDateKey(candidate).getTime() - targetTime,
    );
    const closestDistance = Math.abs(
      fromDateKey(closest).getTime() - targetTime,
    );
    return candidateDistance < closestDistance ? candidate : closest;
  });
}

function mondayOf(date: Date): Date {
  const day = date.getUTCDay();
  return addDays(date, day === 0 ? -6 : 1 - day);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fromDateKey(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function dayHeading(date: Date, today: string): string {
  const delta = Math.round(
    (date.getTime() - fromDateKey(today).getTime()) / DAY_MS,
  );
  if (delta === 0) return "TODAY";
  if (delta === 1) return "TOMORROW";
  if (delta === -1) return "YESTERDAY";
  return formatMonthDay(date);
}

function weekHeading(date: Date, today: string): string {
  const anchor = mondayOf(fromDateKey(today));
  const delta = Math.round((date.getTime() - anchor.getTime()) / (DAY_MS * 7));
  if (delta === 0) return "THIS WEEK";
  if (delta === 1) return "NEXT WEEK";
  if (delta === -1) return "LAST WEEK";
  return `${formatMonthDay(date)} — ${formatMonthDay(addDays(date, 6))}`;
}

/** A day key's date, for example "26 AUG". */
function formatMonthDay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}
