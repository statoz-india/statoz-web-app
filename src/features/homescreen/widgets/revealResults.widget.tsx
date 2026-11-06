"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

import type { TrendingResult } from "@/core";
import { quizResultsHref } from "@/utils";

import styles from "../css/revealResults.module.css";

/** Where the row's scroll position is kept for the browser session. */
const SCROLL_KEY = "home/reveal-results/scroll";

/** From 140% browser text size, the row shows one card at a time. */
const LARGE_TEXT_PX = 16 * 1.4;

/**
 * REVEAL RESULTS: the player's settled match quizzes they haven't opened yet,
 * newest submission first. Left out when there are none.
 */
export function RevealResults({ results }: { results: TrendingResult[] }) {
  if (!results.length) return null;
  const cards = results
    .filter((r, i) => results.findIndex((o) => o.quizId === r.quizId) === i)
    .sort((a, b) => Date.parse(b.quizSubmissionTime) - Date.parse(a.quizSubmissionTime));

  return (
    <section aria-labelledby="reveal-results" className="flex flex-col gap-4">
      <h2 id="reveal-results" className={styles.title}>
        Reveal results
      </h2>
      <CardRow>
        {cards.map((result) => (
          <div key={result.quizId} className={styles.slide}>
            <RevealCard result={result} />
          </div>
        ))}
      </CardRow>
    </section>
  );
}

const largeText = () =>
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize) >= LARGE_TEXT_PX;

/**
 * A sideways row that snaps each card to the left. Arrow keys move a card,
 * Home and End jump to the ends, and the position lasts the session.
 */
function CardRow({ children }: { children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const single = useSyncExternalStore(noSubscribe, largeText, () => false);

  useEffect(() => {
    const saved = readScroll();
    if (row.current && saved) row.current.scrollLeft = saved;
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const el = row.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const step = card.getBoundingClientRect().width + Number.parseFloat(getComputedStyle(el).columnGap);
    const moves: Record<string, () => void> = {
      ArrowRight: () => el.scrollBy({ left: step, behavior: "smooth" }),
      ArrowLeft: () => el.scrollBy({ left: -step, behavior: "smooth" }),
      Home: () => el.scrollTo({ left: 0, behavior: "smooth" }),
      End: () => el.scrollTo({ left: el.scrollWidth, behavior: "smooth" }),
    };
    if (event.target !== el || !moves[event.key]) return;
    event.preventDefault();
    moves[event.key]();
  }

  return (
    <div
      ref={row}
      role="region"
      aria-label="Reveal results cards"
      tabIndex={0}
      data-single={single || undefined}
      className={styles.row}
      onKeyDown={onKeyDown}
      onScroll={(event) => writeScroll(event.currentTarget.scrollLeft)}
      // A card that gets focus is brought into view.
      onFocus={(event) => {
        if (event.target !== event.currentTarget) {
          event.target.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }}
    >
      {children}
    </div>
  );
}

const noSubscribe = () => () => {};

function readScroll(): number {
  try {
    return Number(sessionStorage.getItem(SCROLL_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeScroll(left: number) {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(left)));
  } catch {
    // Private windows can refuse storage; the row just starts at the left.
  }
}

/** A gold link to the quiz's results screen, where REVEAL RESULTS plays the settlement. */
function RevealCard({ result }: { result: TrendingResult }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const entrance = useEntrance(ref);
  const name = `${result.teamA.displayName} vs ${result.teamB.displayName}`;

  return (
    <Link
      ref={ref}
      href={quizResultsHref(result.quizId)}
      aria-label={`Reveal quiz results for ${name}`}
      className={styles.reveal}
      onFocus={entrance.finish}
      onPointerDown={entrance.finish}
    >
      <span className={styles.name}>{name}</span>
      <span aria-hidden>›</span>
    </Link>
  );
}

const ENTRANCE: Keyframe[] = [
  { opacity: 0, transform: "translate3d(0, 12px, 0)" },
  { opacity: 1, transform: "translate3d(0, 0, 0)" },
];
const ENTRANCE_MS = 420;
const ENTRANCE_EASE = "cubic-bezier(.215, .61, .355, 1)";
/** Cards lower on the screen start a little later: 0, 48, 96 or 144ms. */
const STAGGER_MS = 48;

/**
 * Fades the card up the first time 8% of it is on screen. It pauses while
 * off screen or in a hidden tab, and focus or a press finishes it at once.
 */
function useEntrance(ref: RefObject<HTMLElement | null>) {
  const animation = useRef<Animation | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (
      !node ||
      typeof IntersectionObserver === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    // Paused on its first frame, so the card starts hidden and 12px low.
    const run = node.animate(ENTRANCE, {
      duration: ENTRANCE_MS,
      easing: ENTRANCE_EASE,
      fill: "both",
    });
    run.pause();
    animation.current = run;
    let started = false;
    let inView = false;

    const sync = () => {
      if (run.playState === "finished") return;
      if (inView && !document.hidden) run.play();
      else run.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !started) {
          started = true;
          const third = Math.floor(entry.boundingClientRect.top / (innerHeight / 3));
          run.effect?.updateTiming({ delay: Math.min(3, Math.max(0, third)) * STAGGER_MS });
        }
        sync();
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    run.finished.then(() => observer.disconnect(), () => {});
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      run.cancel();
      animation.current = null;
    };
  }, [ref]);

  return { finish: () => animation.current?.finish() };
}
