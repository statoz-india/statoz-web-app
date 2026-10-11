import type { ReactNode } from "react";

import { RateLimitedError } from "@/lib";
import { SignalOffIcon } from "@/utils";
import {
  BentoGrid,
  BentoTile,
  type BentoSpan,
} from "@/widgets/ui/components/bento-grid";

/* -------------------------------------------------------------------------
 * What a feed shows in place of its content: while it loads, when the load
 * failed, and when there is nothing to list.
 * ---------------------------------------------------------------------- */

const skeletonSpans: BentoSpan[] = [
  "wide",
  "square",
  "square",
  "square",
  "wide",
  "square",
  "square",
  "wide",
];

function SkeletonPlate({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-elevated/50 ${className}`}
      style={{ clipPath: "var(--ds-clip-panel)" }}
    />
  );
}

/** Stands in for a trending grid, laid out on the same bento. */
export function BentoSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <BentoGrid>
        {skeletonSpans.map((span, index) => (
          <BentoTile key={index} span={span}>
            <SkeletonPlate className="h-full min-h-42" />
          </BentoTile>
        ))}
      </BentoGrid>
    </div>
  );
}

/** Stands in for a list of fixture cards or game banners. */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonPlate key={index} className="h-44" />
      ))}
    </div>
  );
}

function FeedMessage({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-90 place-items-center text-center">
      <div className="flex max-w-sm flex-col items-center gap-3 text-muted">
        {icon}
        <p className="font-display text-sm font-black tracking-wide text-foreground">
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

export type FeedErrorProps = {
  /** What failed to load, as it reads after "We couldn't load". */
  subject: string;
  error: unknown;
  onRetry: () => void;
};

/**
 * A failed load. It never retries on its own: the API's request budget is
 * shared by everyone behind one address, so a retry loop would spend it.
 */
export function FeedError({ subject, error, onRetry }: FeedErrorProps) {
  return (
    <div role="alert">
      <FeedMessage
        icon={<SignalOffIcon size={34} className="text-cyan" />}
        title="SIGNAL UNAVAILABLE"
      >
        <p className="text-sm leading-body">
          {error instanceof RateLimitedError
            ? "Too many requests from this network. Give it a minute, then try again."
            : `We couldn't load ${subject}. Check your connection and try again.`}
        </p>
        {/* The focus outline sits on the unclipped button; the chamfered
            plate inside it would otherwise clip the ring away. */}
        <button type="button" onClick={onRetry} className="group mt-1">
          <span
            className="inline-flex min-h-10 items-center bg-cyan/12 px-5 font-display text-xs font-bold tracking-wide text-cyan transition-colors duration-200 group-hover:bg-cyan/20"
            style={{ clipPath: "var(--ds-clip-chip)" }}
          >
            TRY AGAIN
          </span>
        </button>
      </FeedMessage>
    </div>
  );
}

export type FeedEmptyProps = {
  icon: ReactNode;
  title: string;
  note: string;
};

/** A feed that loaded and has nothing in it. */
export function FeedEmpty({ icon, title, note }: FeedEmptyProps) {
  return (
    <FeedMessage icon={icon} title={title}>
      <p className="text-sm leading-body">{note}</p>
    </FeedMessage>
  );
}
