import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeftIcon, BrandIcon, CloseIcon } from "@/utils";
import { PointerStage } from "@/widgets/ui/components/pointer-stage";

import styles from "./comingSoon.module.css";

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
 * Placeholder for destinations that aren't built yet: a chamfered card with an
 * icon, the title, a short note, and a way back.
 *
 * The card floats over a grid floor and leans toward the mouse. Its layers
 * stand off the face at different depths, so they part as it turns.
 */
export default function ComingSoonScreen({
  feature,
  description = "We're building something new here. Check back soon.",
  // Preloaded: while the text fades in, the logo is the largest thing painted.
  icon = <BrandIcon name="logo" size={56} alt="" preload />,
  action = { label: "Back to sports", href: "/" },
  onClose,
}: ComingSoonScreenProps) {
  return (
    <PointerStage
      aria-labelledby="coming-soon-title"
      className={`${styles.stage} flex flex-1 items-center justify-center px-4 py-12`}
    >
      <div aria-hidden className={styles.floor} />

      <div className={`${styles.rise} w-full max-w-sm`}>
        <div aria-hidden className={styles.shadow} />

        <div className={styles.card} data-coming-soon-card>
          {/* 1px chamfered border layer around the face */}
          <div aria-hidden className={styles.edge}>
            <div className={styles.face} />
          </div>

          <div
            className={`${styles.content} flex flex-col items-center px-6 py-10 text-center`}
          >
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="absolute top-2 right-2 grid size-10 place-items-center text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                <CloseIcon size={22} />
              </button>
            ) : null}

            <div aria-hidden className={`${styles.emblem} text-cyan`}>
              <span className={styles.ping} />
              <span className={styles.ping} />
              <span className={styles.ping} />
              <div className={styles.icon}>{icon}</div>
            </div>

            {/* An h2: the top bar's title is the page's h1. */}
            <h2
              id="coming-soon-title"
              className={`${styles.title} mt-4 font-display font-bold uppercase leading-tight`}
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
              className={`${styles.note} mt-3 max-w-xs text-balance text-md leading-relaxed text-muted`}
            >
              {description}
            </p>

            {action ? (
              // The focus outline sits on the unclipped link; the chamfered
              // plate inside it would otherwise clip the ring away.
              <Link
                href={action.href}
                className={`${styles.action} group mt-8 inline-flex`}
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
          </div>
        </div>
      </div>
    </PointerStage>
  );
}
