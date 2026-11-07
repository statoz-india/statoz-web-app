import { TrackView } from "@/lib/analytics/trackView";

import type { Guide } from "./guides";
import {
  AccentPanel,
  HowToPlayPage,
  IconTile,
  SectionLabel,
  tint,
} from "./parts";

/** `/profile/how-to-play/<mode>`: what the mode is, how a round goes, and the rules. */
export function HowToPlayGuide({ guide }: { guide: Guide }) {
  const { accent } = guide;
  return (
    <HowToPlayPage
      title={guide.title}
      subtitle={guide.subtitle}
      accent={accent}
      back="/profile/how-to-play"
    >
      <TrackView event="web_how_to_play_open" params={{ mode: guide.id }} />
      {/* Phones stack the blocks. Desktop: header, strip and facts on the
          left; steps take the right, the full height. */}
      <div className="grid items-start gap-3.5 lg:grid-cols-[21.25rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <div className="flex flex-col gap-3.5">
          <AccentPanel accent={accent} className="flex items-start gap-3.5 p-4">
            <IconTile icon={guide.icon} accent={accent} size={48} />
            <div>
              <h3 className="font-display text-base font-black tracking-tight">
                {guide.title}
              </h3>
              <p className="mt-1.75 font-sans text-sm leading-body text-subtle">
                {guide.purpose}
              </p>
            </div>
          </AccentPanel>

          <ul className="grid grid-cols-3 gap-2">
            {guide.overview.map(({ label, sub, icon: Icon, accent: cell }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-0.75 border px-2 py-3.5 text-center"
                style={{ borderColor: tint(cell, 35), background: tint(cell, 7) }}
              >
                <Icon size={22} className="mb-1" style={{ color: cell }} />
                <span className="font-display text-micro font-black tracking-wide">
                  {label}
                </span>
                <span className="font-sans text-micro leading-tight text-muted">
                  {sub}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <AccentPanel accent={accent} className="flex flex-col gap-3.5 p-4">
          <SectionLabel>HOW IT WORKS</SectionLabel>
          <ol className="flex flex-col gap-3.5">
            {guide.steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span
                  className="ds-tabular grid size-7 shrink-0 place-items-center border font-display text-compact font-bold"
                  style={{
                    color: accent,
                    borderColor: tint(accent, 50),
                    background: tint(accent, 14),
                  }}
                >
                  {index + 1}
                </span>
                <div className="pt-1">
                  <h4 className="font-display text-sm font-bold tracking-label">
                    {step.title}
                  </h4>
                  <p className="mt-1.25 font-sans text-compact leading-body text-subtle">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          </AccentPanel>
        </div>

        <Facts guide={guide} />
      </div>
    </HowToPlayPage>
  );
}

function Facts({ guide }: { guide: Guide }) {
  return (
    <AccentPanel accent={guide.accent} className="flex flex-col gap-3.5 p-4">
      <SectionLabel>GOOD TO KNOW</SectionLabel>
      <ul className="flex flex-col gap-2.5">
        {guide.facts.map(({ label, body, icon: Icon }, index) => (
          <li key={label}>
            {index > 0 ? (
              <div
                aria-hidden
                className="mb-2.5 h-0.5"
                style={{
                  background:
                    "linear-gradient(to right, transparent, color-mix(in srgb, var(--ds-color-accent-cyan) 90%, transparent), color-mix(in srgb, var(--ds-color-accent-violet) 75%, transparent), transparent)",
                }}
              />
            ) : null}
            <div className="flex items-start gap-2.75">
              <Icon
                size={16}
                className="mt-px shrink-0"
                style={{ color: guide.accent }}
              />
              <div>
                <h4 className="font-display text-xs font-bold tracking-tight">
                  {label}
                </h4>
                <p className="mt-1 font-sans text-xs leading-body text-muted">
                  {body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AccentPanel>
  );
}
