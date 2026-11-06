"use client";

import Image from "next/image";
import { useEffect, useEffectEvent } from "react";

import { IMAGES } from "@/config/images";
import { CheckIcon } from "@/lib/icons";
import { formatInt } from "@/utils";

import styles from "../css/pickLocked.module.css";

/** The overlay is removed this long after it opens; sooner with reduced motion. */
const SHOW_MS = 1850;
const SHOW_REDUCED_MS = 400;

/** What was just bought: this purchase only, not the whole ticket. */
export type LockedPick = { outcome: string; stake: number; shares: number };

/**
 * PICK LOCKED: flashes over everything after CONFIRM PICK, states what was
 * bought, and clears itself. Nothing on it can be pressed.
 */
export function PickLocked({ pick, onDone }: { pick: LockedPick; onDone: () => void }) {
  const done = useEffectEvent(onDone);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => done(), reduced ? SHOW_REDUCED_MS : SHOW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      className={`${styles.overlay} fixed inset-0 z-90 flex flex-col items-center justify-center px-[calc(1.75rem+env(safe-area-inset-left))] py-7 text-center font-display font-black`}
    >
      <span className={`${styles.check} grid size-28 place-items-center text-success`}>
        <CheckIcon size={58} />
      </span>
      <p className={`${styles.title} ${styles.rise} mt-6 text-locked tracking-broad text-foreground`}>
        PICK LOCKED
      </p>
      <p className={`${styles.rise} mt-2.5 text-sm tracking-brisk text-gold uppercase`}>
        {pick.outcome}
      </p>
      <p
        className={`${styles.strip} ${styles.rise} ds-tabular mt-3 flex items-center gap-3.5 px-3.5 py-2.5 text-2xs tracking-snug`}
      >
        <Image src={IMAGES.icons.ozCoins} alt="" width={16} height={16} className="shrink-0" />
        <span className="text-foreground">{formatInt(pick.stake)} STAKE</span>
        <span className="text-cyan">{formatInt(pick.shares)} SHARES</span>
        <span className="text-success">{formatInt(pick.shares * 100)} MAX</span>
      </p>
    </div>
  );
}
