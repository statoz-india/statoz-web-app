"use client";

import {
  useEffect,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import { sportModules, type Sport } from "@/config/sports";
import {
  BasketballIcon,
  CricketIcon,
  EditIcon,
  FootballIcon,
  MotorsportIcon,
  type IconProps,
} from "@/lib/icons";
import { accentVar } from "@/styles";
import { formatInt } from "@/utils";

import styles from "../css/profile.module.css";

export const SPORT_ICONS: Record<Sport, ComponentType<IconProps>> = {
  football: FootballIcon,
  cricket: CricketIcon,
  basketball: BasketballIcon,
  racing: MotorsportIcon,
};

export const sportColor = (sport: Sport) =>
  accentVar(sportModules[sport].accent);

/** `color` mixed `percent`% into the panel fill, as one opaque colour. */
export const onPanel = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, var(--ds-color-background-secondary))`;

/** Delays a card's entrance; see the motion table in the design. */
export const enter = (delay: number) => ({
  className: styles.enter,
  style: { "--delay": `${delay}ms` } as CSSProperties,
});

/**
 * An octagon with a rim: the edge colour behind, the fill inset by `width`, so
 * the cut corners keep their line. The fill must be opaque.
 */
export function Cut({
  edge,
  fill,
  width = "1px",
  clip = "var(--ds-clip-field)",
  className = "",
  style,
  children,
}: {
  edge: string;
  fill: string;
  width?: string;
  clip?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div style={{ clipPath: clip, background: edge, padding: width, ...style }}>
      <div className={className} style={{ clipPath: clip, background: fill }}>
        {children}
      </div>
    </div>
  );
}

/** Every card on the page: a 12px octagon with a hard drop shadow. */
export function Panel({
  edge = "var(--ds-color-border-default)",
  delay,
  label,
  className = "",
  children,
}: {
  edge?: string;
  /** Entrance delay in ms; no entrance when left out. */
  delay?: number;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const motion = delay === undefined ? null : enter(delay);
  return (
    <section
      aria-label={label}
      className={`drop-shadow-[0_5px_0_var(--ds-color-fixture-shadow)] ${motion?.className ?? ""}`}
      style={motion?.style}
    >
      <Cut
        edge={edge}
        fill="var(--ds-color-background-secondary)"
        clip="var(--ds-clip-panel)"
        className={className}
      >
        {children}
      </Cut>
    </section>
  );
}

export function EditButton({
  label,
  onClick,
  tint = "page",
  className = "",
}: {
  label: string;
  onClick: () => void;
  tint?: "page" | "cyan";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-8 shrink-0 place-items-center border border-cyan/55 text-cyan transition-colors duration-150 hover:bg-cyan/20 ${tint === "page" ? "bg-background/86" : "bg-cyan/12"} ${className}`}
    >
      <EditIcon size={16} />
    </button>
  );
}

export function IconBox({ icon: Icon }: { icon: ComponentType<IconProps> }) {
  return (
    <span className="grid size-10.5 shrink-0 place-items-center border border-cyan/46 bg-cyan/10 text-cyan">
      <Icon size={21} />
    </span>
  );
}

/** Counts up from 0 over 600ms, or shows the value at once for reduced motion. */
export function CountUp({
  value,
  format = formatInt,
}: {
  value: number;
  format?: (value: number) => string;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 600;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      setShown(value * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{format(shown)}</>;
}

/** A labelled number in a 10px octagon: the coin and stat band cells. */
export function StatCell({
  label,
  labelColor,
  fill,
  valueColor = "var(--ds-color-text-default)",
  children,
}: {
  label: string;
  labelColor: string;
  fill: string;
  valueColor?: string;
  children: ReactNode;
}) {
  return (
    <Cut
      edge={onPanel("var(--ds-color-border-strong)", 30)}
      fill={fill}
      className="flex min-h-16 flex-col justify-center px-3"
    >
      <span
        className="font-display text-nano font-black tracking-wide"
        style={{ color: labelColor }}
      >
        {label}
      </span>
      <span
        className="ds-tabular mt-1.5 font-display text-badge font-black leading-compact"
        style={{ color: valueColor }}
      >
        {children}
      </span>
    </Cut>
  );
}
