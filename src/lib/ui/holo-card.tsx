import type { CSSProperties, ReactNode } from "react";

import { CloseIcon } from "@/lib/icons";
import { PointerStage, type PointerStageProps } from "@/lib/ui/pointer-stage";

import styles from "./css/holo-card.module.css";

export type HoloCardProps = PointerStageProps & {
  /** Hovers over pinging rings above the content; glyphs render cyan. */
  icon: ReactNode;
  /** Puts a cross in the card's top right corner that runs this. */
  onClose?: () => void;
};

/**
 * A chamfered card floating over a grid floor, leaning toward the mouse. Its
 * layers stand off the face at different depths, so they part as it turns;
 * raise the content's own layers with `holoLayer`.
 */
export function HoloCard({
  icon,
  onClose,
  children,
  className = "",
  ...stage
}: HoloCardProps) {
  return (
    <PointerStage {...stage} className={`${styles.stage} ${className}`}>
      <div aria-hidden className={styles.floor} />

      <div className={`${styles.rise} w-full max-w-sm`}>
        <div aria-hidden className={styles.shadow} />

        <div className={styles.card}>
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

            {children}
          </div>
        </div>
      </div>
    </PointerStage>
  );
}

/**
 * Props for a layer of the card's content: raised `depth` px off the face, and
 * faded in `delay` ms after the card opens.
 */
export function holoLayer(depth: number, delay: number) {
  return {
    className: styles.layer,
    style: { "--depth": `${depth}px`, "--delay": `${delay}ms` } as CSSProperties,
  };
}
