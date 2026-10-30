"use client";

import type { CSSProperties, KeyboardEvent } from "react";

import styles from "./filterChips.module.css";

export type FilterChipsProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  accent?: string;
  label: string;
  className?: string;
};

/**
 * A scrollable strip of cut-corner chips.
 *
 * The active chip is the only tinted, outlined element; the rest stay calm
 * muted outlines, and none of them glow. Reach for it where a surface already
 * carries a focal element and the switch itself should stay quiet — a match
 * report's sections, a catalogue's facets.
 */
export function FilterChips({
  options,
  selected,
  onSelect,
  accent = "var(--ds-color-accent-cyan)",
  label,
  className,
}: FilterChipsProps) {
  function moveSelection(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % options.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + options.length) % options.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    onSelect(options[nextIndex]);
    const tabs =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabs?.[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={[styles.list, className ?? ""].filter(Boolean).join(" ")}
    >
      {options.map((option, index) => {
        const active = option === selected;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(option)}
            onKeyDown={(event) => moveSelection(event, index)}
            className={styles.chip}
            data-active={active || undefined}
            style={
              {
                "--filter-chip-accent": accent,
              } as CSSProperties
            }
          >
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}
