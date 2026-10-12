import type { ComponentType, ReactNode } from "react";

import type { IconProps } from "@/utils";

export type NoDataStateProps = {
  /** The large glyph. Sized and tinted by this component. */
  icon: ComponentType<IconProps>;
  /** Small badge over the glyph's lower right — what the absence is waiting on. */
  spark?: ComponentType<IconProps>;
  title: string;
  message: string;
  /** Tints the glyph. Defaults to cyan. */
  accent?: string;
  /** Optional way out of the empty state. */
  action?: ReactNode;
  className?: string;
};

/**
 * The house empty state: one oversized accent glyph with a white spark riding
 * its corner, a shouted title and a short explanation of what would fill the
 * space.
 *
 * Used wherever a surface has nothing to show — a fixture with no markets, a
 * board before its first entry, a match before its first commentary line — so
 * every nothing on the platform reads the same way.
 */
export function NoDataState({
  icon: Glyph,
  spark: Spark,
  title,
  message,
  accent = "var(--ds-color-accent-cyan)",
  action,
  className,
}: NoDataStateProps) {
  return (
    <div
      className={[
        "grid place-items-center px-7 py-7 text-center",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="grid max-w-77.5 justify-items-center">
        <div className="relative grid h-24 w-29.5 place-items-center">
          <Glyph
            size={78}
            aria-hidden="true"
            style={{ color: `color-mix(in srgb, ${accent} 86%, transparent)` }}
          />
          {Spark ? (
            <Spark
              size={25}
              aria-hidden="true"
              className="absolute right-3 bottom-1.5"
              style={{
                color:
                  "color-mix(in srgb, var(--ds-color-text-default) 82%, transparent)",
              }}
            />
          ) : null}
        </div>

        <strong className="mt-3.5 font-display text-sm font-black tracking-wider text-white">
          {title.toUpperCase()}
        </strong>
        <p className="mt-2 text-[13px] leading-[1.35] font-semibold text-(--ds-color-text-muted)">
          {message}
        </p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
