"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

export type UnderlineTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Prints the label beside an icon; icon-only tabs remain compact by default. */
  showLabel?: boolean;
  /** Runs a callback instead of selecting — for trailing actions like "more". */
  action?: () => void;
};

export type UnderlineTabsProps = {
  tabs: UnderlineTab[];
  /** Index of the selected tab, or -1 when nothing on this strip is selected. */
  activeIndex: number;
  onChange: (index: number) => void;
  /** Drives the wash, the underline, and the strip's bottom hairline. */
  accent: string;
  /** Optional identity color for each tab icon, in the same order as `tabs`. */
  iconColors?: string[];
  label: string;
  /** Trailing cell pinned to the end of the strip, outside the scroll area. */
  trailing?: ReactNode;
  /** Minimum width for each tab. When set, the strip scrolls horizontally. */
  minTabWidth?: number;
  className?: string;
};

/**
 * Flat tab strip whose only live element is a glowing underline that slides
 * between tabs. Low-key by design, for dense browse surfaces that already
 * carry a focal element.
 */
export function UnderlineTabs({
  tabs,
  activeIndex,
  onChange,
  accent,
  iconColors,
  label,
  trailing,
  minTabWidth,
  className,
}: UnderlineTabsProps) {
  if (iconColors && iconColors.length !== tabs.length) {
    throw new Error("UnderlineTabs iconColors must match the tabs length.");
  }

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(from: number, delta: number) {
    const next = (from + delta + tabs.length) % tabs.length;
    tabRefs.current[next]?.focus();
    if (!tabs[next].action) onChange(next);
  }

  // The underline spans the middle 64% of the active tab's cell.
  const cell = 100 / Math.max(tabs.length, 1);
  const underline = {
    left: `${cell * activeIndex + cell * 0.18}%`,
    width: `${cell * 0.64}%`,
    background: accent,
    boxShadow: `0 0 10px color-mix(in srgb, ${accent} 70%, transparent)`,
  } satisfies CSSProperties;

  return (
    <div
      className={[
        "flex h-12.5 min-h-10 shrink-0 border-b bg-background/40",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
      }}
    >
      <div className="h-full min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label={label}
          className="relative flex h-full min-w-full"
          style={minTabWidth ? { width: "max-content" } : undefined}
        >
          {tabs.map((tab, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role={tab.action ? undefined : "tab"}
                aria-selected={tab.action ? undefined : active}
                aria-label={tab.label}
                title={tab.label}
                tabIndex={Boolean(tab.action) || active ? 0 : -1}
                onClick={() => (tab.action ? tab.action() : onChange(index))}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    move(index, 1);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    move(index, -1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    tabRefs.current[0]?.focus();
                    if (!tabs[0]?.action) onChange(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    const last = tabs.length - 1;
                    tabRefs.current[last]?.focus();
                    if (!tabs[last]?.action) onChange(last);
                  }
                }}
                className="flex min-h-10 flex-1 items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
                style={{
                  minWidth: minTabWidth,
                  color: active ? accent : "var(--ds-color-text-muted)",
                  background: active
                    ? `color-mix(in srgb, ${accent} 7%, transparent)`
                    : undefined,
                }}
              >
                {tab.icon ? (
                  <span className="flex min-w-0 items-center justify-center gap-2 px-2">
                    <span
                      aria-hidden
                      className="grid shrink-0 place-items-center transition-colors duration-200"
                      style={
                        iconColors?.[index]
                          ? {
                              color: active
                                ? iconColors[index]
                                : `color-mix(in srgb, ${iconColors[index]} 58%, transparent)`,
                            }
                          : undefined
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.showLabel ? (
                      <span className="truncate font-display text-2xs font-black tracking-wide">
                        {tab.label}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="truncate px-1 font-display text-2xs font-black tracking-ultra">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}

          {activeIndex >= 0 && activeIndex < tabs.length ? (
            <span
              aria-hidden
              className="absolute bottom-0 h-0.75 transition-[left,width] duration-300 ease-out"
              style={underline}
            />
          ) : null}
        </div>
      </div>

      {trailing ? (
        <div
          className="grid min-h-10 w-12 shrink-0 place-items-center border-l"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
          }}
        >
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
