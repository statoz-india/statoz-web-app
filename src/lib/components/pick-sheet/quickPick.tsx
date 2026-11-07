"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { loadPick, submitPickBet, type Pick } from "@/core";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Button } from "@/lib/components/button";
import type { PickType } from "@/utils";

import { BuySheet } from "./buySheet";
import { marketOf, sharePrice } from "./market";
import { PickLocked, type LockedPick } from "./pickLocked";

type Loaded = { status: "loading" } | { status: "error" } | { status: "ready"; pick: Pick };

/**
 * A card's option, bought without leaving the screen: the market's live odds
 * load, BUY's sheet opens on that option, and PICK LOCKED flashes once it's
 * placed. `onClose` runs when it's all over, placed or not. Mount it only
 * after a tap; it renders on the body.
 */
export function QuickPick(props: Parameters<typeof QuickPickFlow>[0]) {
  // The body only exists in the browser; the server and hydration render nothing.
  const onClient = useSyncExternalStore(noSubscribe, () => true, () => false);
  // On the body, so a card's carousel or animation can't trap the overlays.
  return onClient ? createPortal(<QuickPickFlow {...props} />, document.body) : null;
}

const noSubscribe = () => () => {};

function QuickPickFlow({
  type,
  code,
  outcome: outcomeKey,
  balance,
  onPlaced,
  onClose,
}: {
  type: PickType;
  /** The market's code, as `pickHref` takes it. */
  code: string;
  /** The tapped option: a side (`A`), an option (`Y`) or a choice's `choiceId`. */
  outcome: string;
  /** The player's Oz; `null` until it loads. */
  balance: number | null;
  /** After the bet is placed, with the stake and the market it moved. */
  onPlaced: (coins: number, pick: Pick) => void;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [locked, setLocked] = useState<LockedPick | null>(null);
  // Read by the sheet's close, which runs right after a successful buy.
  const placed = useRef(false);

  useEffect(() => {
    let live = true;
    loadPick(type, code).then(
      (pick) => live && setLoaded({ status: "ready", pick }),
      () => live && setLoaded({ status: "error" }),
    );
    return () => {
      live = false;
    };
  }, [type, code, attempt]);

  if (locked) return <PickLocked pick={locked} onDone={onClose} />;
  if (loaded.status === "loading") return <Waiting onClose={onClose} />;

  const market = loaded.status === "ready" ? marketOf(loaded.pick) : null;
  const outcome = market?.outcomes.find((o) => o.key === outcomeKey);
  if (loaded.status === "error" || !market || !outcome) {
    return (
      <Problem
        text={loaded.status === "error" ? "Couldn't load this pick." : "This pick isn't available."}
        onRetry={
          loaded.status === "error"
            ? () => {
                setLoaded({ status: "loading" });
                setAttempt((n) => n + 1);
              }
            : undefined
        }
        onClose={onClose}
      />
    );
  }

  const pick = loaded.pick;
  return (
    <BuySheet
      market={market}
      outcome={outcome}
      balance={balance}
      onClose={() => {
        if (!placed.current) onClose();
      }}
      onBuy={async (coins) => {
        const result = await submitPickBet(pick, outcome.betValue, coins);
        if ("error" in result) return result.error;
        placed.current = true;
        onPlaced(coins, result.pick);
        // The share price before this bet moved the odds.
        setLocked({ outcome: outcome.label, stake: coins, shares: Math.floor(coins / sharePrice(outcome)) });
        return null;
      }}
    />
  );
}

/** A scrim while the market loads; a press on it gives up. */
function Waiting({ onClose }: { onClose: () => void }) {
  useScrollLock();
  return (
    <div
      role="status"
      aria-label="Loading pick"
      onClick={onClose}
      className="fixed inset-0 z-80 grid place-items-center bg-(--ds-color-overlay-scrim)"
    >
      <span aria-hidden className="size-8 animate-spin rounded-pill border-3 border-cyan border-t-transparent" />
    </div>
  );
}

function Problem({
  text,
  onRetry,
  onClose,
}: {
  text: string;
  onRetry?: () => void;
  onClose: () => void;
}) {
  useScrollLock();
  return (
    <div
      role="alertdialog"
      aria-label={text}
      className="fixed inset-0 z-80 grid place-items-center bg-(--ds-color-overlay-scrim) px-4"
    >
      <div
        className="flex w-full max-w-90 flex-col gap-4 p-5"
        style={{ clipPath: "var(--ds-clip-panel)", background: "var(--ds-gradient-hud-sheet)" }}
      >
        <p className="font-grotesk text-sm text-foreground">{text}</p>
        <div className={`grid gap-2.5 ${onRetry ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button variant="surface" fullWidth onClick={onClose}>
            CLOSE
          </Button>
          {onRetry ? (
            <Button fullWidth onClick={onRetry}>
              TRY AGAIN
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
