import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon, BrandIcon } from "@/utils";

export type ComingSoonScreenProps = {
  /** Name of the feature that isn't ready yet, e.g. "Shop". */
  feature?: string;
  /** One or two sentences on what's coming. */
  description?: string;
  /** Shown above the title. Defaults to the StatOz logo; glyphs render cyan. */
  icon?: ReactNode;
  /** Where the call to action leads. Pass `null` to hide it. */
  action?: { label: string; href: string } | null;
};

/**
 * Placeholder for destinations that aren't built yet: a flat chamfered panel
 * with an icon, the title, a short note, and a way back.
 */
export default function ComingSoonScreen({
  feature,
  description = "We're building something new here. Check back soon.",
  icon = <BrandIcon name="logo" size={56} alt="" />,
  action = { label: "Back to sports", href: "/" },
}: ComingSoonScreenProps) {
  return (
    <section
      aria-labelledby="coming-soon-title"
      className="flex flex-1 items-center justify-center px-4 py-12"
    >
      {/* 1px chamfered border layer around the panel */}
      <div
        className="w-full max-w-sm bg-line-muted p-px"
        style={{ clipPath: "var(--ds-clip-panel)" }}
      >
        <div
          className="flex flex-col items-center bg-surface px-6 py-10 text-center"
          style={{ clipPath: "var(--ds-clip-panel)" }}
        >
          <div aria-hidden className="grid place-items-center text-cyan">
            {icon}
          </div>

          <h1
            id="coming-soon-title"
            className="mt-6 font-display font-bold uppercase leading-tight"
          >
            {feature ? (
              <span className="mb-2 block text-xs tracking-ultra text-muted">
                {feature}
              </span>
            ) : null}
            <span className="block text-2xl tracking-display text-foreground">
              Coming soon
            </span>
          </h1>

          <p className="mt-3 max-w-xs text-balance text-md leading-relaxed text-muted">
            {description}
          </p>

          {action ? (
            // The focus outline sits on the unclipped link; the chamfered
            // plate inside it would otherwise clip the ring away.
            <Link href={action.href} className="group mt-8 inline-flex">
              <span
                className="inline-flex min-h-10 items-center gap-2 bg-cyan/12 px-5 font-display text-xs font-bold uppercase tracking-wide text-cyan transition-colors duration-200 group-hover:bg-cyan/20"
                style={{ clipPath: "var(--ds-clip-chip)" }}
              >
                <ArrowLeftIcon
                  size={16}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                {action.label}
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
