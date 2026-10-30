import { typography } from "@/styles";
import type { CSSProperties } from "react";

export type GoalMouthPlacement = { x: number; y: number; label: string } | null;

export function GoalMouthStructure({
  left = 12,
  right = 88,
  top = 12,
  bottom = 88,
}: {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}) {
  return (
    <g aria-hidden>
      {Array.from({ length: 7 }, (_, index) => {
        const x = left + ((right - left) * index) / 6;
        return (
          <line
            key={`x-${x}`}
            x1={x}
            x2={x}
            y1={top}
            y2={bottom}
            opacity=".18"
          />
        );
      })}
      {Array.from({ length: 5 }, (_, index) => {
        const y = top + ((bottom - top) * index) / 4;
        return (
          <line
            key={`y-${y}`}
            x1={left}
            x2={right}
            y1={y}
            y2={y}
            opacity=".18"
          />
        );
      })}
      <path
        d={`M ${left} ${bottom} L ${left} ${top} L ${right} ${top} L ${right} ${bottom}`}
        fill="none"
        strokeWidth="2.5"
      />
    </g>
  );
}

export function GoalMouthDiagram({
  placement,
  caption,
}: {
  placement: GoalMouthPlacement;
  caption?: string;
}) {
  return (
    <figure style={{ margin: 0 }}>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={
          placement
            ? `Goal placement: ${placement.label}`
            : (caption ?? "Goal placement unavailable")
        }
        style={
          {
            width: "100%",
            height: 116,
            color: "var(--ds-color-text-default)",
            background: "var(--ds-color-background-muted)",
          } as CSSProperties
        }
      >
        <g stroke="currentColor">
          <GoalMouthStructure />
        </g>
        {placement ? (
          <circle
            cx={placement.x}
            cy={placement.y}
            r="4"
            fill="var(--ds-color-accent-gold)"
            stroke="var(--ds-color-text-inverse)"
            strokeWidth="1.5"
          />
        ) : null}
      </svg>
      <figcaption
        style={{
          minHeight: 20,
          paddingTop: 4,
          color: placement
            ? "var(--ds-color-accent-gold)"
            : "var(--ds-color-text-muted)",
          fontFamily: "var(--ds-font-display)",
          fontSize: "var(--ds-text-2xs)",
          fontWeight: typography.weight.black,
          textAlign: "center",
          letterSpacing: "var(--ds-tracking-wide)",
        }}
      >
        {placement?.label ?? caption ?? "PLACEMENT NOT PUBLISHED"}
      </figcaption>
    </figure>
  );
}
