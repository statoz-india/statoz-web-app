"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

export type GlidingTab = {
  id: string;
  label: string;
  /** Identity color; the active plate morphs between these as it travels. */
  accent: string;
  icon: ReactNode;
};

export type GlidingTabsProps = {
  tabs: GlidingTab[];
  activeIndex: number;
  onChange: (index: number) => void;
  /** Names the tab strip for assistive technology. */
  label: string;
  className?: string;
};

/**
 * A calm dark tab strip with one raised, chamfered plate that glides — and
 * color-morphs between the per-tab accents — as the selection changes. Resting
 * tabs stay tinted toward their own accent so each identity reads at a glance.
 */
export function GlidingTabs({
  tabs,
  activeIndex,
  onChange,
  label,
  className,
}: GlidingTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    onChange(next);
    tabRefs.current[next]?.focus();
  }

  const plateStyle = {
    width: `${100 / tabs.length}%`,
    transform: `translateX(${activeIndex * 100}%)`,
    background: tabs[activeIndex]?.accent,
    clipPath: "var(--ds-clip-tab-plate)",
  } satisfies CSSProperties;

  return (
    <div
      role="tablist"
      aria-label={label}
      className={[
        "relative h-[61px] min-h-10 shrink-0 border-t border-black/15 bg-surface-nav",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 transition-[transform,background-color] duration-300 ease-out"
        style={plateStyle}
      />

      <div className="relative flex h-full">
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusTab(index + 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusTab(index - 1);
                }
              }}
              className="flex min-h-10 flex-1 flex-col items-center justify-center gap-[5px]"
              style={{
                color: active
                  ? "var(--ds-color-text-inverse)"
                  : `color-mix(in srgb, ${tab.accent} 68%, var(--ds-color-text-muted))`,
              }}
            >
              <span
                className={[
                  "grid size-[18px] place-items-center transition-transform duration-300",
                  active ? "scale-100" : "scale-[0.84]",
                ].join(" ")}
              >
                {tab.icon}
              </span>
              <span
                className={[
                  "font-display transition-all duration-200",
                  active
                    ? "text-2xs font-black tracking-label"
                    : "text-2xs font-semibold tracking-tight",
                ].join(" ")}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
