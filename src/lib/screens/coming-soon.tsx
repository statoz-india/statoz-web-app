import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon, BrandIcon } from "@/lib/icons";
import { HoloCard, holoLayer } from "@/lib/ui/holo-card";

export type ComingSoonScreenProps = {
  /** Name of the feature that isn't ready yet, e.g. "Shop". */
  feature?: string;
  /** One or two sentences on what's coming. */
  description?: string;
  /** Shown above the title. Defaults to the StatOz logo; glyphs render cyan. */
  icon?: ReactNode;
  /** Where the call to action leads. Pass `null` to hide it. */
  action?: { label: string; href: string } | null;
  /**
   * Set when the screen is shown as a popup: puts a cross in the card's top
   * right corner that runs this.
   */
  onClose?: () => void;
};

/**
 * Placeholder for destinations that aren't built yet: the holo card with an
 * icon, the title, a short note, and a way back.
 */
export default function ComingSoonScreen({
  feature,
  description = "We're building something new here. Check back soon.",
  // Preloaded: while the text fades in, the logo is the largest thing painted.
  icon = <BrandIcon name="logo" size={56} alt="" preload />,
  action = { label: "Back to sports", href: "/" },
  onClose,
}: ComingSoonScreenProps) {
  const title = holoLayer(36, 220);
  const note = holoLayer(18, 300);
  const link = holoLayer(30, 380);
  return (
    <HoloCard
      aria-labelledby="coming-soon-title"
      icon={icon}
      onClose={onClose}
      className="flex flex-1 items-center justify-center px-4 py-12"
    >
      {/* An h2: the top bar's title is the page's h1. */}
      <h2
        id="coming-soon-title"
        className={`${title.className} mt-4 font-display font-bold uppercase leading-tight`}
        style={title.style}
      >
        {feature ? (
          <span className="mb-2 block text-xs tracking-ultra text-muted">
            {feature}
          </span>
        ) : null}
        <span className="block text-2xl tracking-display text-foreground">
          Coming soon
        </span>
      </h2>

      <p
        className={`${note.className} mt-3 max-w-xs text-balance text-md leading-relaxed text-muted`}
        style={note.style}
      >
        {description}
      </p>

      {action ? (
        // The focus outline sits on the unclipped link; the chamfered
        // plate inside it would otherwise clip the ring away.
        <Link
          href={action.href}
          className={`${link.className} group mt-8 inline-flex`}
          style={link.style}
        >
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
    </HoloCard>
  );
}
