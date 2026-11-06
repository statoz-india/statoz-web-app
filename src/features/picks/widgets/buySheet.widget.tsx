"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { IMAGES } from "@/config/images";
import { useCurrentUser } from "@/features/auth";
import { useNow } from "@/hooks/useNow";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatInt } from "@/utils";

import { isTrading, multiplier, sharePrice, type Market, type Outcome } from "../adapters";
import styles from "../css/pickDetail.module.css";

const QUICK = [1, 5, 10, "MAX"] as const;

/**
 * BUY's sheet: any stake up to the balance, what its whole shares could win,
 * and CONFIRM PICK.
 * `onBuy` resolves to the error to show, or `null` once the pick is placed.
 */
export function BuySheet({
  market,
  outcome,
  onBuy,
  onClose,
}: {
  market: Market;
  outcome: Outcome;
  onBuy: (coins: number) => Promise<string | null>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const balance = useCurrentUser()?.coins ?? null;
  const now = useNow();
  const price = sharePrice(outcome);
  const [text, setText] = useState(String(price));
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useScrollLock();
  // A modal <dialog>: Escape, the focus trap and stacking come from the browser.
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const stake = /^\d+$/.test(text) ? Number(text) : 0;
  // Only whole shares pay out; the rest of an odd stake buys no share.
  const shares = Math.floor(stake / price);
  const maxShares = balance === null ? 0 : Math.floor(balance / price);
  const invalid = !isTrading(market, now)
    ? "This market is closed."
    : balance !== null && balance < 1
      ? "Not enough Oz Coins."
      : balance !== null && stake > balance
        ? "Stake is above your balance."
        : stake < 1
          ? "Stake must be at least 1 Oz."
          : null;
  // The balance loads with the session; until then nothing can be confirmed.
  const ready = !invalid && balance !== null && !saving;

  const setShares = (n: number) => {
    setText(String(n * price));
    setFailure(null);
  };

  return (
    <dialog
      ref={ref}
      aria-label="Buy pick"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The panel fills the dialog, so only a press on the backdrop lands here.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`${styles.sheet} fixed inset-x-0 top-auto bottom-0 m-0 max-h-[90dvh] w-full max-w-none overflow-visible bg-transparent p-0 text-foreground drop-shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-110`}
    >
      <div className={`${styles.sheetPanel} flex max-h-[90dvh] flex-col overflow-y-auto md:h-dvh md:max-h-none`}>
        <div aria-hidden className={`${styles.sheetEdge} sticky top-0 h-0.5 shrink-0`} />
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 font-display text-compact font-black tracking-stretch text-cyan">
              BUY PICK
            </h2>
            <span
              className={`${styles.outcomePill} ds-tabular px-2.25 py-1.5 font-display text-2xs font-black tracking-label uppercase`}
              style={{ "--tone": outcome.color } as CSSProperties}
            >
              {outcome.label} {outcome.percent}%
            </span>
          </div>
          <p className="mt-2.5 font-grotesk text-badge font-bold leading-tight">{market.question}</p>
          <p className="ds-tabular mt-1.5 flex flex-wrap gap-x-2.5 font-display text-nano font-black tracking-ultra">
            <span className="text-muted">{price} OZ / SHARE</span>
            <span className="text-gold">PAYS {multiplier(price)} IF RIGHT</span>
          </p>

          <div className={`${styles.stepper} mt-3.5 flex h-19`}>
            <button
              type="button"
              aria-label="One share less"
              disabled={shares <= 1}
              onClick={() => setShares(shares - 1)}
              className={`${styles.step} w-12 shrink-0 font-display text-badge font-black`}
            >
              −
            </button>
            <label className="flex flex-1 flex-col items-center justify-center gap-1.5">
              <span className="font-display text-micro font-black tracking-reach text-cyan/82">
                STAKE
              </span>
              <span className="flex items-center gap-1.75">
                <Image src={IMAGES.icons.ozCoins} alt="" width={18} height={18} className="shrink-0" />
                <input
                  value={text}
                  inputMode="numeric"
                  aria-label="Stake in Oz"
                  onChange={(event) => {
                    setText(event.target.value.replace(/\D/g, ""));
                    setFailure(null);
                  }}
                  className={`${styles.stakeInput} ds-tabular w-28 bg-transparent pb-0.75 text-center font-display text-2xl font-black tracking-tight`}
                />
              </span>
            </label>
            <button
              type="button"
              aria-label="One share more"
              disabled={balance === null || (shares + 1) * price > balance}
              onClick={() => setShares(shares + 1)}
              className={`${styles.step} w-12 shrink-0 font-display text-badge font-black`}
            >
              +
            </button>
          </div>

          <div className={`${styles.plate} mt-3 flex h-12 items-center gap-1.5 px-3`}>
            <span className="mr-auto font-display text-nano font-black tracking-sweep text-lime/68">
              TO WIN
            </span>
            <Image src={IMAGES.icons.ozCoins} alt="" width={16} height={16} className="shrink-0" />
            {/* Keyed by the value, so it rises again each time it changes. */}
            <span
              key={shares}
              className={`${styles.payout} ds-tabular font-display text-badge font-black tracking-hair text-lime`}
            >
              {formatInt(shares * 100)}
            </span>
            <span
              className={`${styles.multiplier} ds-tabular ml-1 px-1.5 py-0.75 font-display text-chip font-black tracking-fine`}
            >
              {multiplier(price)}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1.75">
            {QUICK.map((chip) => {
              // MAX puts the whole balance in; the others are whole shares.
              const coins = chip === "MAX" ? (balance ?? 0) : chip * price;
              const allowed = chip === "MAX" ? coins >= 1 : chip <= maxShares;
              return (
                <button
                  key={chip}
                  type="button"
                  disabled={!allowed}
                  data-active={(allowed && stake === coins) || undefined}
                  onClick={() => {
                    setText(String(coins));
                    setFailure(null);
                  }}
                  className={`${styles.quickChip} ds-tabular h-8 font-display text-2xs font-black tracking-snug`}
                >
                  {chip === "MAX" ? "MAX" : `${chip}×`}
                </button>
              );
            })}
          </div>

          <p className="ds-tabular mt-2.5 font-display text-nano font-black tracking-ultra text-muted">
            {shares} {shares === 1 ? "SHARE" : "SHARES"} · BALANCE AFTER{" "}
            {balance === null ? "—" : formatInt(balance - stake)} OZ
          </p>
          {invalid || failure ? (
            <p role="alert" className="mt-2 font-grotesk text-xs font-bold text-orange">
              {invalid ?? failure}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!ready}
            onClick={async () => {
              setSaving(true);
              setFailure(null);
              const failed = await onBuy(stake);
              setSaving(false);
              if (failed) setFailure(failed);
              else onClose();
            }}
            className={`${styles.confirm} mt-6.5 min-h-13 w-full font-display text-md font-black tracking-span`}
          >
            {saving ? "CONFIRMING" : "CONFIRM PICK"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
