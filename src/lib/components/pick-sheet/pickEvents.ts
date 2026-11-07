import { pickCode, type Pick } from "@/core";
import { track } from "@/lib/analytics";

import { sharePrice, type Outcome } from "./market";

/** Where a pick was placed from. */
export type PickLocation = "pick_page" | "home_card" | "match_tab";

const pickParams = (pick: Pick, outcome: Outcome, location: PickLocation) => ({
  pick_type: pick.type,
  pick_id: pickCode(pick),
  outcome: outcome.key,
  // The odds before this bet moves them.
  odds: outcome.percent,
  location,
});

/** BUY's sheet opened on `outcome`. */
export function trackBuySheet(pick: Pick, outcome: Outcome, location: PickLocation) {
  track("web_buy_sheet_open", pickParams(pick, outcome, location));
}

/** A bet's answer: placed when `error` is `null`, refused otherwise. */
export function trackBet(
  pick: Pick,
  outcome: Outcome,
  coins: number,
  location: PickLocation,
  error: string | null,
) {
  const params = pickParams(pick, outcome, location);
  if (error !== null) {
    track("web_pick_failed", { ...params, reason: error });
    return;
  }
  track("web_pick_placed", {
    ...params,
    stake: coins,
    shares: Math.floor(coins / sharePrice(outcome)),
  });
  track("web_spend_virtual_currency", {
    virtual_currency_name: "Oz",
    value: coins,
    item_name: pick.type,
  });
}
