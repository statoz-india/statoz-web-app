import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";

import { ChevronRightIcon, type IconProps } from "@/lib/icons";

import { BackButton } from "./back-button";

/** `color` at `percent`% over whatever is behind it. */
export const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

/** The page shell: the header, then the blocks 14px apart. */
export function HowToPlayPage({
  title,
  subtitle,
  accent,
  back,
  fill = false,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  /** Where Back goes when there's no history in this tab. */
  back: string;
  /** Stretches the content to the screen's height, for a docked button. */
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-260 pb-8 ${fill ? "flex flex-1 flex-col" : ""}`}
    >
      <header className="flex min-h-14 items-center gap-2 px-2 pt-2 lg:px-6 lg:pt-4">
        <BackButton fallback={back} />
        <div className="min-w-0">
          <h2
            className="truncate font-display text-xl font-black leading-compact tracking-label"
            style={{ color: accent }}
          >
            {title}
          </h2>
          <p className="mt-1 font-display text-micro font-black leading-compact tracking-ultra text-muted">
            {subtitle}
          </p>
        </div>
      </header>
      <div
        className={`flex flex-col gap-3.5 px-4 pt-3.5 lg:px-6 ${fill ? "flex-1" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Every card on these pages: square top, 12px cuts at the bottom, a 1px edge
 * in the accent at 50% and the elevated fill.
 */
export function AccentPanel({
  accent,
  className = "",
  children,
}: {
  accent: string;
  className?: string;
  children: ReactNode;
}) {
  const clip: CSSProperties = { clipPath: "var(--ds-clip-fixture-flat)" };
  return (
    <div className="h-full p-px" style={{ ...clip, background: tint(accent, 50) }}>
      <div className={`h-full bg-surface-elevated ${className}`} style={clip}>
        {children}
      </div>
    </div>
  );
}

export function IconTile({
  icon: Icon,
  accent,
  size,
}: {
  icon: ComponentType<IconProps>;
  accent: string;
  size: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center border"
      style={{
        width: size,
        height: size,
        color: accent,
        borderColor: tint(accent, 45),
        background: tint(accent, 12),
      }}
    >
      <Icon size={size / 2} />
    </span>
  );
}

/** `HOW IT WORKS` and `GOOD TO KNOW`. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="ds-tabular font-display text-2xs font-bold tracking-mega text-cyan/70">
      {children}
    </h3>
  );
}

/** A hub card: icon tile, title, tagline and a tag, linking to `href`. */
export function DirectoryCard({
  href,
  accent,
  icon,
  title,
  tagline,
  meta,
}: {
  href: string;
  accent: string;
  icon: ComponentType<IconProps>;
  title: string;
  tagline: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="block h-full transition duration-150 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--accent) motion-reduce:hover:translate-y-0"
      style={{ "--accent": accent } as CSSProperties}
    >
      <AccentPanel accent={accent} className="flex items-center gap-3.5 p-3.5">
        <IconTile icon={icon} accent={accent} size={52} />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-md font-black tracking-tight">
            {title}
          </span>
          <span className="mt-1.25 block font-sans text-compact leading-tight text-subtle">
            {tagline}
          </span>
          <span
            className="ds-tabular mt-2 inline-block border px-1.75 py-0.5 font-display text-nano font-black tracking-ultra"
            style={{
              color: accent,
              background: tint(accent, 12),
              borderColor: tint(accent, 40),
            }}
          >
            {meta}
          </span>
        </span>
        <ChevronRightIcon size={22} style={{ color: tint(accent, 80) }} />
      </AccentPanel>
    </Link>
  );
}
