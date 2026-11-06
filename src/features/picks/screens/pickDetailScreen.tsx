"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useAuthGate, useAuthSession } from "@/features/auth";
import { Button } from "@/lib/components/button";
import { isPickType, readableSegment } from "@/utils";

import { marketOf, openingOdds, ticketsOf } from "../adapters";
import { placeBet, usePick, usePickBets, usePickOdds } from "../data/picks.data";
import { MarketOdds } from "../widgets/marketOdds.widget";
import { PickMarket } from "../widgets/pickMarket.widget";

/** `/picks/[type]/[id]`: one prediction, event or future market. Needs an account. */
export function PickDetailScreen() {
  const { type, id: segment } = useParams<{ type: string; id: string }>();
  // The item's code, such as `IPL26-M12-P1`; never its `_id`.
  const code = readableSegment(segment);
  const router = useRouter();
  const { status } = useAuthSession();
  const known = isPickType(type);
  const signedIn = known && status === "authenticated";
  const pickType = known ? type : "prediction";
  const pick = usePick(pickType, code, signedIn);
  const bets = usePickBets(pick.data);
  const odds = usePickOdds(pick.data);
  const searchParams = useSearchParams();

  // A guest sees only the login prompt; NOT NOW leaves the page.
  useEffect(() => {
    if (status !== "guest") return;
    useAuthGate.getState().open({
      intent: "view this pick",
      onCancel: () => {
        if (window.history.length > 1) router.back();
        else router.replace("/");
      },
    });
  }, [status, router]);

  if (!known) return <Message text="This pick doesn't exist." />;
  if (status !== "authenticated") return null;
  if (!pick.data) {
    return pick.status === "error" ? (
      <div className="grid justify-items-center gap-3 px-4 py-10 text-center">
        <p className="font-sans text-sm text-muted">Couldn&apos;t load this pick.</p>
        <Button variant="tonal" size="sm" onClick={pick.reload}>
          TRY AGAIN
        </Button>
      </div>
    ) : (
      <div
        role="status"
        aria-label="Loading pick"
        className="mx-4 mt-3 h-80 animate-pulse bg-surface-elevated/50 lg:mx-6"
      />
    );
  }

  const market = marketOf(pick.data);
  if (!market || !market.outcomes.length) {
    return <Message text="This pick isn't available." />;
  }
  // A card's outcome tap opens the screen with it selected.
  const current = pick.data;
  return (
    <PickMarket
      market={market}
      initialOutcome={searchParams.get("outcome")}
      // Without its bets the market still works; it just shows no tickets.
      tickets={ticketsOf(market.outcomes, bets.data ?? [])}
      chart={
        odds.data ? (
          <MarketOdds market={market} opening={openingOdds(current)} history={odds.data} />
        ) : odds.status === "error" ? (
          <div className="flex items-center justify-between gap-3 py-2">
            <p className="font-sans text-sm text-muted">Couldn&apos;t load the odds.</p>
            <Button variant="tonal" size="sm" onClick={odds.reload}>
              TRY AGAIN
            </Button>
          </div>
        ) : (
          <div role="status" aria-label="Loading odds" className="h-52 animate-pulse bg-surface-elevated/50" />
        )
      }
      onBuy={(outcome, coins) => placeBet(current, outcome, coins)}
    />
  );
}

function Message({ text }: { text: string }) {
  return (
    <p className="px-4 py-10 text-center font-display text-xs font-black tracking-label text-muted uppercase">
      {text}
    </p>
  );
}
