import Link from "next/link";
import type { ComponentType } from "react";

import {
  ChevronRightIcon,
  MatchIcon,
  PickIcon,
  type IconProps,
} from "@/lib/icons";
import { accentVar } from "@/styles";

import { CountUp, Panel, StatCell } from "../components/surfaces";
import type { StatBand } from "../types";

const ICONS: Record<StatBand["id"], ComponentType<IconProps>> = {
  predicts: MatchIcon,
  picks: PickIcon,
};

const HISTORY_HREFS: Record<StatBand["id"], string> = {
  predicts: "/profile/history/predict",
  picks: "/profile/history/pick",
};

// Four labels don't fit across a phone, so they go two by two there.
const COLUMNS: Record<number, string> = {
  2: "grid-cols-2",
  4: "grid-cols-2 sm:grid-cols-4",
};

/** PREDICTS or PICKS: a title and a row of counters. */
export function StatBandWidget({
  band,
  delay,
}: {
  band: StatBand;
  delay: number;
}) {
  const accent = accentVar(band.accent);
  const Icon = ICONS[band.id];
  return (
    <Panel label={band.title} delay={delay} className="p-3.5">
      <div className="flex items-center gap-2.25">
        <Icon size={20} style={{ color: accent }} />
        <h3
          className="font-display text-base font-black tracking-label"
          style={{ color: accent }}
        >
          {band.title}
        </h3>
        <Link
          href={HISTORY_HREFS[band.id]}
          aria-label={`${band.title} history`}
          className="ml-auto flex min-h-11 items-center font-display text-2xs font-black tracking-label text-muted transition-colors duration-150 hover:text-foreground"
        >
          HISTORY
          <ChevronRightIcon size={14} />
        </Link>
      </div>
      <div className={`mt-3 grid gap-2 ${COLUMNS[band.cells.length] ?? "grid-cols-3"}`}>
        {band.cells.map((cell) => (
          <StatCell
            key={cell.label}
            label={cell.label}
            labelColor={`color-mix(in srgb, ${accent} 90%, transparent)`}
            fill="var(--ds-color-background-secondary)"
          >
            <CountUp
              value={cell.value}
              format={(v) => `${Math.round(v)}${cell.suffix ?? ""}`}
            />
          </StatCell>
        ))}
      </div>
    </Panel>
  );
}
