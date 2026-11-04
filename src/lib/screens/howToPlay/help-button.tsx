import Link from "next/link";
import type { CSSProperties } from "react";

import { QuizIcon } from "@/lib/icons";

import { guideFor } from "./guides";
import { tint } from "./parts";

/** The small square button another screen uses to open one mode's guide. */
export function HelpButton({
  mode,
  className = "",
}: {
  /** A guide id, such as `pick`. */
  mode: string;
  className?: string;
}) {
  const guide = guideFor(mode);
  if (!guide) return null;
  return (
    <Link
      href={`/profile/how-to-play/${guide.id}`}
      aria-label={`How to play ${guide.title.toLowerCase()}`}
      title="How to play"
      className={`grid size-8 shrink-0 place-items-center border transition duration-140 hover:scale-105 hover:brightness-112 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) motion-reduce:hover:scale-100 ${className}`}
      style={
        {
          "--accent": guide.accent,
          color: guide.accent,
          borderColor: tint(guide.accent, 40),
          background: tint(guide.accent, 8),
        } as CSSProperties
      }
    >
      <QuizIcon size={18} />
    </Link>
  );
}
