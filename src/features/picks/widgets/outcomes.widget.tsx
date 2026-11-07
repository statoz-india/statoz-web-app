import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { IMAGES } from "@/config/images";
import { useNow } from "@/hooks/useNow";
import { ArrowRightIcon, QuizIcon } from "@/lib/icons";
import { accentVar, feedbackVar, readableInk } from "@/styles";
import { formatInt, matchHref } from "@/utils";

import { isTrading, priceRule, type Market, type Outcome, type Ticket } from "../adapters";
import styles from "../css/pickDetail.module.css";
import { Metric, SectionHeading } from "./marketHeader.widget";

const TICKET_TONE: Record<Ticket["status"], string> = {
  PENDING: accentVar("cyan"),
  WON: feedbackVar("success"),
  LOST: feedbackVar("danger"),
};

/** The outcome rows, the price rule and the quiz link. */
export function Outcomes({
  market,
  selected,
  tickets,
  onSelect,
  onBuy,
}: {
  market: Market;
  selected: Outcome;
  /** One per bet, newest first; marks the outcomes backed. */
  tickets: Ticket[];
  onSelect: (key: string) => void;
  onBuy: (outcome: Outcome) => void;
}) {
  const now = useNow();
  const trading = isTrading(market, now);
  return (
    <>
      <section aria-labelledby="pick-outcomes" className="flex flex-col gap-2">
        <SectionHeading id="pick-outcomes">OUTCOMES</SectionHeading>
        {market.outcomes.map((outcome) => {
          const on = outcome.key === selected.key;
          return (
            <div
              key={outcome.key}
              data-selected={on || undefined}
              className={`${styles.row} flex items-center gap-2.5 p-2.5`}
              style={{ "--tone": outcome.color } as CSSProperties}
            >
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(outcome.key)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex items-baseline">
                  <span className="truncate font-grotesk text-sm font-bold">
                    {outcome.label}
                  </span>
                  {tickets.some((t) => t.key === outcome.key) ? (
                    <span className="ml-1.75 shrink-0 font-display text-nano font-black tracking-airy text-cyan">
                      BACKED
                    </span>
                  ) : null}
                </span>
                <span aria-hidden className={`${styles.meter} mt-1.25 block h-1.5`}>
                  <span
                    className="block h-full"
                    style={{ width: `${outcome.percent}%`, background: outcome.color }}
                  />
                </span>
              </button>
              <span
                className="ds-tabular font-display text-badge font-black"
                style={{ color: outcome.color }}
              >
                {outcome.percent}%
              </span>
              <button
                type="button"
                disabled={!trading}
                aria-label={trading ? `Buy ${outcome.label}` : undefined}
                onClick={() => onBuy(outcome)}
                className={`${styles.buy} grid h-9.5 w-19.5 shrink-0 place-items-center font-display font-black tracking-broad ${trading ? "text-2xs" : "text-nano"}`}
                style={trading ? { color: readableInk(outcome.color) } : undefined}
              >
                {trading ? "BUY" : "LOCKED"}
              </button>
            </div>
          );
        })}
      </section>

      <p className={`${styles.note} p-3.5 font-grotesk text-compact font-bold text-muted`}>
        {priceRule(selected.percent)}
      </p>

      {market.matchId ? (
        <Link
          href={matchHref(market.matchId, market.gameType)}
          className={`${styles.quizLink} flex min-h-12.5 items-center justify-center gap-2.25 font-display text-compact font-black tracking-spread text-cyan`}
        >
          <QuizIcon size={16} />
          PREDICTION QUIZ
          <ArrowRightIcon size={16} />
        </Link>
      ) : null}
    </>
  );
}

/** One YOUR TICKET per bet, or the line that says why there's none. */
export function Tickets({
  market,
  tickets,
  placed,
}: {
  market: Market;
  /** One per bet, newest first. */
  tickets: Ticket[];
  /** The last pick placed here, e.g. "Pick placed: 54 Oz on Draw." */
  placed: string | null;
}) {
  const now = useNow();
  if (tickets.length) {
    return tickets.map((ticket) => <TicketPanel key={ticket.id} ticket={ticket} />);
  }
  return (
    <div className={`${styles.row} flex items-center gap-2.5 p-3.5`}>
      <Image src={IMAGES.icons.ozCoins} alt="" width={18} height={18} className="shrink-0" />
      <p className="font-grotesk text-compact text-muted">
        {placed ??
          (isTrading(market, now)
            ? "Pick an outcome to create your ticket."
            : "Market is closed with no ticket held.")}
      </p>
    </div>
  );
}

/** YOUR TICKET: one bet. A share pays 100 Oz if right. */
function TicketPanel({ ticket }: { ticket: Ticket }) {
  const tone = TICKET_TONE[ticket.status];
  return (
    <section
      aria-label={`Your ticket on ${ticket.label}`}
      className={`${styles.ticket} flex flex-col gap-3 p-3.5`}
      style={{ "--tone": tone } as CSSProperties}
    >
      <div
        className="flex items-center justify-between gap-3 font-display font-black tracking-airy"
        style={{ color: tone }}
      >
        <h3 className="text-xs">YOUR TICKET</h3>
        <span className="text-micro">{ticket.status}</span>
      </div>
      <p className="truncate font-display text-question font-black tracking-firm">
        {ticket.label}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="STAKE" value={`${formatInt(ticket.stake)} Oz`} />
        <Metric label="SHARES" value={formatInt(ticket.shares)} />
        <Metric label="MAX PAYOUT" value={`${formatInt(ticket.shares * 100)} Oz`} />
      </div>
    </section>
  );
}
