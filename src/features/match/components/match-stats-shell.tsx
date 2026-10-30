"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";

import { accentVar } from "@/styles";
import { SignalOffIcon, type IconProps } from "@/lib/icons";
import { NoDataState } from "@/lib/ui/no-data-state";
import type {
  MatchDetailStat,
  MatchIntel,
  SportMatch,
} from "@/features/match/types";

import styles from "./match-stats.module.css";

export function SectionHeading({ label }: { label: string }) {
  return <h3 className={styles.sectionHeading}>{label}</h3>;
}

/**
 * The flat data surface every stat row, event card and roster row sits on —
 * the market detail's outcome-row container. Tinting is opt-in, and it never
 * glows.
 */
export function StatsRow({
  accent,
  selected = false,
  onSelect,
  className,
  children,
}: {
  accent?: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}) {
  // An untinted row keeps the neutral edge at full strength; a tinted one
  // shows its accent at 40%, as the app's shell does.
  const style = {
    "--row-accent": accent ?? "var(--ds-color-border-default)",
    "--row-edge": accent ? undefined : "var(--ds-color-border-default)",
  } as CSSProperties;
  const classes = [
    styles.statsRow,
    selected ? styles.statsRowSelected : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!onSelect) {
    return (
      <div className={classes} style={style}>
        {children}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

/**
 * One home-vs-away metric, shaped like a market outcome row: the two values as
 * big tabular figures either side of the label, over a meter split at the home
 * side's share.
 */
export function StatComparisonRow({
  stat,
  homeColor,
  awayColor,
  selected,
  onSelect,
}: {
  stat: MatchDetailStat;
  homeColor: string;
  awayColor: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const total = stat.homeValue + stat.awayValue;
  const share = total <= 0 ? 0.5 : stat.homeValue / total;
  const homeLeads = share >= 0.5;
  const homeFlex = Math.min(995, Math.max(5, Math.round(share * 1000)));

  return (
    <StatsRow
      accent={homeLeads ? homeColor : awayColor}
      selected={selected}
      onSelect={onSelect}
    >
      <span className={styles.comparisonHead}>
        <b
          style={{
            color: homeLeads ? homeColor : "var(--ds-color-text-default)",
          }}
        >
          {stat.home}
        </b>
        <small>{stat.label.toUpperCase()}</small>
        <b
          style={{
            color: homeLeads ? "var(--ds-color-text-default)" : awayColor,
          }}
        >
          {stat.away}
        </b>
      </span>
      <span className={styles.splitBar}>
        <i style={{ flexGrow: homeFlex, background: homeColor }} />
        <i style={{ flexGrow: 1000 - homeFlex, background: awayColor }} />
      </span>
    </StatsRow>
  );
}

/** The home/away identity pair that heads a comparison block. */
export function TeamLegendRow({ match }: { match: SportMatch }) {
  return (
    <div className={styles.legendRow}>
      <TeamLegendMark
        name={match.home.name}
        short={match.home.shortName}
        color={match.home.secondaryTextColor ?? match.home.color}
      />
      <TeamLegendMark
        name={match.away.name}
        short={match.away.shortName}
        color={match.away.secondaryTextColor ?? match.away.color}
        alignEnd
      />
    </div>
  );
}

function TeamLegendMark({
  name,
  short,
  color,
  alignEnd = false,
}: {
  name: string;
  short: string;
  color: string;
  alignEnd?: boolean;
}) {
  return (
    <span
      className={[styles.legendMark, alignEnd ? styles.legendMarkEnd : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <i style={{ background: color }} />
      <span>
        <b style={{ color }}>{short.toUpperCase()}</b>
        <small>{name.toUpperCase()}</small>
      </span>
    </span>
  );
}

/** The competition, ground and facts block every report carries. */
export function MatchIntelPanel({
  match,
  intel,
}: {
  match: SportMatch;
  intel: MatchIntel;
}) {
  const statusColor =
    match.status === "live"
      ? "var(--ds-color-danger)"
      : match.status === "finished"
        ? accentVar("cyan")
        : accentVar("gold");
  return (
    <StatsRow accent={statusColor} className={styles.intelPanel}>
      <b className={styles.intelTitle}>{intel.competition.toUpperCase()}</b>
      <p className={styles.intelSeason}>{intel.season}</p>
      <div className={styles.intelCells}>
        <span className={styles.intelCell}>
          <small>VENUE</small>
          <b>{intel.venue}</b>
        </span>
        <span className={styles.intelCell}>
          <small>ATTENDANCE</small>
          <b className="ds-tabular">{intel.attendance ?? "—"}</b>
        </span>
      </div>
      <dl className={styles.intelFacts}>
        {intel.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {intel.resultNote ? (
        <p className={styles.intelResult}>{intel.resultNote.toUpperCase()}</p>
      ) : null}
    </StatsRow>
  );
}

/**
 * A section with nothing in it yet. The same empty state the rest of the
 * platform uses, so a report waiting on a feed reads like every other absence.
 */
export function EmptyPanel({
  title,
  message,
  icon = SignalOffIcon,
  spark,
  accent,
}: {
  title: string;
  message: string;
  icon?: ComponentType<IconProps>;
  spark?: ComponentType<IconProps>;
  accent?: string;
}) {
  return (
    <NoDataState
      icon={icon}
      spark={spark}
      title={title}
      message={message}
      accent={accent}
    />
  );
}
