import { accentVar } from "@/styles";
import { formatPercent } from "@/utils";

import type { MarketOutcome, PickMarket } from "../../types";
import { TileFooter } from "./tile-footer";
import { TileMetaRow } from "./tile-meta-row";
import { SignalPanel } from "@/lib/components/signal-panel";
import { Badge } from "@/lib/components/badge";
import { Progress } from "@/lib/components/progress";

export type TrendingMarketCardProps = {
  market: PickMarket;
  /** `future` is a long-range outright; `pick` is a near-term call. */
  kind: "future" | "pick";
  /** Tall tiles have room to break out every outcome. */
  detailed?: boolean;
};

/** The outcome priced highest, or none when the market lists no outcomes. */
function leadingOutcome(market: PickMarket): MarketOutcome | undefined {
  return market.outcomes.reduce<MarketOutcome | undefined>(
    (leader, outcome) =>
      leader && leader.probabilityPercent >= outcome.probabilityPercent
        ? leader
        : outcome,
    undefined,
  );
}

/** A prediction market tile — the leader's price, or the full outcome board. */
export function TrendingMarketCard({
  market,
  kind,
  detailed = false,
}: TrendingMarketCardProps) {
  const accent = accentVar("cyan");
  const borderAccent = "var(--ds-color-fixture-predicted)";
  const leader = leadingOutcome(market);

  return (
    <SignalPanel
      accent={borderAccent}
      appearance="balanced"
      tag={
        <Badge accent={accent}>{kind === "future" ? "FUTURE" : "PICK"}</Badge>
      }
      href={market.href}
      label={market.question}
      footer={
        <TileFooter
          status={market.statusLabel}
          accent={accent}
          volumeOz={market.volumeOz}
        />
      }
    >
      <TileMetaRow sport={market.sport} leagueLabel={market.leagueLabel} />

      {/* A full sentence, so it takes the body face. Everything else on the
          trending tiles is an identifier or a figure, and takes the display. */}
      <p
        className={[
          "font-sans text-sm font-bold leading-tight",
          detailed ? "line-clamp-3" : "line-clamp-2",
        ].join(" ")}
      >
        {market.question}
      </p>

      {detailed ? (
        <ul className="mt-1 flex flex-col gap-2">
          {market.outcomes.slice(0, 4).map((outcome) => {
            const leading = outcome.id === leader?.id;
            const color = leading ? accent : "var(--ds-color-text-muted)";
            const percent = formatPercent(outcome.probabilityPercent);
            return (
              <li key={outcome.id} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="min-w-0 flex-1 truncate font-display text-2xs font-extrabold tracking-label"
                    style={{ color }}
                  >
                    {outcome.label.toUpperCase()}
                  </span>
                  <span
                    className={[
                      "ds-tabular shrink-0 font-display font-black leading-compact",
                      leading ? "text-base" : "text-2xs",
                    ].join(" ")}
                    style={{ color }}
                  >
                    {percent}
                  </span>
                </div>
                <Progress
                  value={outcome.probabilityPercent / 100}
                  accent={color}
                  label={`${outcome.label} ${percent}`}
                />
              </li>
            );
          })}
        </ul>
      ) : leader ? (
        <div className="mt-auto flex flex-col gap-1">
          <p className="truncate font-display text-2xs font-extrabold tracking-label">
            {leader.label.toUpperCase()}
          </p>
          <span
            className="ds-tabular font-display text-xl font-black leading-compact"
            style={{ color: accent }}
          >
            {formatPercent(leader.probabilityPercent)}
          </span>
        </div>
      ) : null}
    </SignalPanel>
  );
}
