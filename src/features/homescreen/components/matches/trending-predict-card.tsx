import { accentVar } from "@/styles";

import type { PredictMission } from "../../types";
import { TeamBadge } from "./team-badge";
import { TileFooter } from "./tile-footer";
import { TileMetaRow } from "./tile-meta-row";
import { SignalPanel } from "@/lib/components/signal-panel";
import { Badge } from "@/lib/components/badge";

export type TrendingPredictCardProps = {
  mission: PredictMission;
};

const PRIMARY_ACCENT = accentVar("cyan");
const BORDER_ACCENT = "var(--ds-color-fixture-predicted)";

/** A prediction quiz on a fixture. */
export function TrendingPredictCard({ mission }: TrendingPredictCardProps) {
  return (
    <SignalPanel
      accent={BORDER_ACCENT}
      appearance="balanced"
      tag={<Badge accent={PRIMARY_ACCENT}>PREDICT</Badge>}
      href={mission.href}
      label={`Predict ${mission.home.name} versus ${mission.away.name}`}
      footer={
        <TileFooter status={mission.statusLabel} accent={PRIMARY_ACCENT} />
      }
    >
      <TileMetaRow sport={mission.sport} leagueLabel={mission.leagueLabel} />

      {/* The matchup is this tile's focal element, so it carries the weight the
          other kinds give to a figure. */}
      <div className="flex flex-1 items-center justify-between gap-2">
        <TeamBadge team={mission.home} size={46} />
        <span
          className="font-display text-2xs font-black tracking-label"
          style={{ color: PRIMARY_ACCENT }}
        >
          VS
        </span>
        <TeamBadge team={mission.away} size={46} />
      </div>

      <p className="truncate font-display text-sm font-black tracking-label">
        {mission.home.shortName}
        {" // "}
        {mission.away.shortName}
      </p>
    </SignalPanel>
  );
}
