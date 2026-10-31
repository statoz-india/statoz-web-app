"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  Future,
  Prediction,
  TrendingEvent,
  TrendingFixture,
  TrendingPrediction,
  TrendingQuiz as QuizItem,
  TrendingRace,
} from "@/core";
import { TrendingEventWidget } from "@/features/events/widgets/trendingEvent.widget";
import { TrendingFutureWidget } from "@/features/futures/widgets/trendingFuture.widget";
import { TrendingMatchWidget } from "@/features/match/widgets/trendingMatch.widget";
import { TrendingRaceWidget } from "@/features/match/widgets/trendingRace.widget";
import { TrendingPredictionsWidget } from "@/features/predictions/widgets/trendingPredictions.widget";
import { TrendingQuiz } from "@/features/quizzes/widgets/trendingQuiz";

import { BentoSkeleton, FeedError } from "../components/feed-states";
import { useSportsTypes, useTrendingMatches } from "../data/getTrending.data";
import { TrendingSportsQuizWidget } from "../widgets/trendingSportsQuiz.widget";

/** How long scrolling must pause before the loop jumps back, where `scrollend` is missing. */
const SETTLE_MS = 150;

/** A trending future card shows at most this many choices. */
const FUTURE_CHOICES = 5;

type LoopCarouselProps<T> = {
  items: T[];
  keyOf: (item: T) => string;
  /** Names one item in the dots' labels, as in "Show pick 2 of 7". */
  noun: string;
  /** A Tailwind width class for each slide. */
  slideWidth?: string;
  children: (item: T) => ReactNode;
};

/**
 * One card per slide, swiped or scrolled sideways and looping at both ends.
 *
 * The list is drawn three times and the view rests on the middle copy. When a
 * scroll settles in an outer copy, it jumps to the same card in the middle
 * one, so there is always another card either side.
 */
function LoopCarousel<T>({
  items,
  keyOf,
  noun,
  slideWidth = "w-[min(88%,340px)]",
  children,
}: LoopCarouselProps<T>) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = items.length;
  const loops = count > 1;
  const copies = loops ? [0, 1, 2] : [1];

  /** The distance from one slide to the next. */
  const step = () => {
    const slides = track.current?.children;
    return slides && slides.length > 1
      ? (slides[1] as HTMLElement).offsetLeft -
          (slides[0] as HTMLElement).offsetLeft
      : 0;
  };

  // Start on the middle copy's first card, before the first paint.
  useLayoutEffect(() => {
    const element = track.current;
    if (element && loops) element.scrollLeft = count * step();
  }, [count, loops]);

  useEffect(() => {
    const element = track.current;
    if (!element || !loops) return;

    const indexAt = () => Math.round(element.scrollLeft / (step() || 1));
    const settle = () => {
      const index = indexAt();
      if (index < count || index >= 2 * count) {
        element.scrollTo({ left: ((index % count) + count) * step() });
      }
    };

    let timer = 0;
    const hasScrollEnd = "onscrollend" in window;
    const onScroll = () => {
      setActive(indexAt() % count);
      if (!hasScrollEnd) {
        window.clearTimeout(timer);
        timer = window.setTimeout(settle, SETTLE_MS);
      }
    };
    // A resize changes the slide width, so the view is put back on its card.
    const resize = new ResizeObserver(() => {
      element.scrollLeft = ((indexAt() % count) + count) * step();
    });

    element.addEventListener("scroll", onScroll, { passive: true });
    if (hasScrollEnd) element.addEventListener("scrollend", settle);
    resize.observe(element);
    return () => {
      window.clearTimeout(timer);
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("scrollend", settle);
      resize.disconnect();
    };
  }, [count, loops]);

  function goTo(index: number) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    track.current?.scrollTo({
      left: (index + (loops ? count : 0)) * step(),
      behavior: reduced.matches ? "auto" : "smooth",
    });
  }

  if (count === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <div
        ref={track}
        className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {copies.flatMap((copy) =>
          items.map((item) => (
            // The card has no width of its own; the next slide peeks in at the edge.
            <div
              key={`${copy}-${keyOf(item)}`}
              className={`${slideWidth} shrink-0 snap-start`}
              // The outer copies only fill the loop; readers and Tab skip them.
              inert={copy !== 1}
              aria-hidden={copy !== 1 || undefined}
            >
              {children(item)}
            </div>
          )),
        )}
      </div>

      {loops && (
        <div className="flex justify-center">
          {items.map((item, index) => (
            <button
              key={keyOf(item)}
              type="button"
              aria-label={`Show ${noun} ${index + 1} of ${count}`}
              aria-current={index === active || undefined}
              onClick={() => goTo(index)}
              className="group grid h-6 place-items-center px-1"
            >
              <span
                className={`block h-1.5 transition-all motion-reduce:transition-none ${
                  index === active
                    ? "w-5 bg-cyan"
                    : "w-1.5 bg-line group-hover:bg-line-strong"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The trending picks, without a heading. */
function TrendingPicks({ picks }: { picks: Prediction[] }) {
  if (picks.length === 0) return null;
  return (
    <section aria-label="Trending picks">
      <LoopCarousel items={picks} keyOf={(pick) => pick._id} noun="pick">
        {(pick) => <TrendingPredictionsWidget prediction={pick} />}
      </LoopCarousel>
    </section>
  );
}

/** Fixtures under a heading, in the order the API sent them. */
function MatchesSection({
  id,
  title,
  matches,
}: {
  id: string;
  title: string;
  matches: TrendingFixture[];
}) {
  if (matches.length === 0) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2
        id={id}
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => (
          <TrendingMatchWidget key={match._id} match={match} />
        ))}
      </div>
    </section>
  );
}

/** The trending races under their heading, in the order the API sent them. */
function TrendingRaces({ races }: { races: TrendingRace[] }) {
  const visible = races.filter((race) => race.isVisible);
  if (visible.length === 0) return null;
  return (
    <section aria-labelledby="trending-races" className="flex flex-col gap-3">
      <h2
        id="trending-races"
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        Trending Races
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {visible.map((race) => (
          <TrendingRaceWidget key={race._id} race={race} />
        ))}
      </div>
    </section>
  );
}

/** The trending quizzes under their heading, in the order the API sent them. */
function TrendingQuizzes({ quizzes }: { quizzes: QuizItem[] }) {
  if (quizzes.length === 0) return null;
  return (
    <section aria-labelledby="trending-quizzes" className="flex flex-col gap-3">
      <h2
        id="trending-quizzes"
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        Trending Quizzes
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        {quizzes.map((quiz) => (
          <TrendingQuiz key={quiz._id} quiz={quiz} />
        ))}
      </div>
    </section>
  );
}

/** Every trending event in one panel, in the order the API sent them. */
function TrendingEvents({ events }: { events: TrendingEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section aria-labelledby="trending-events" className="flex flex-col gap-3">
      <h2
        id="trending-events"
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        Trending Events
      </h2>
      {/* Events do not say which sport they are, so the panel keeps its default accent. */}
      <TrendingEventWidget sport="trending" events={events} showAll />
    </section>
  );
}

/** The trending predictions under their heading, in the order the API sent them. */
function TrendingPredictions({
  predictions,
}: {
  predictions: TrendingPrediction[];
}) {
  if (predictions.length === 0) return null;
  return (
    <section
      aria-labelledby="trending-predictions"
      className="flex flex-col gap-3"
    >
      <h2
        id="trending-predictions"
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        Trending Predictions
      </h2>
      <LoopCarousel
        items={predictions}
        keyOf={(prediction) => prediction._id}
        noun="prediction"
      >
        {(prediction) => <TrendingPredictionsWidget prediction={prediction} />}
      </LoopCarousel>
    </section>
  );
}

/** The trending futures under their heading, in the order the API sent them. */
function TrendingFutures({ futures }: { futures: Future[] }) {
  if (futures.length === 0) return null;
  return (
    <section aria-labelledby="trending-futures" className="flex flex-col gap-3">
      <h2
        id="trending-futures"
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        Trending Futures
      </h2>
      <LoopCarousel
        items={futures}
        keyOf={(future) => future._id}
        noun="future"
        // Two cards and the two gaps after them, with a fifth of a card left to peek.
        slideWidth="w-[calc((100%-2rem)/2.2)]"
      >
        {(future) => (
          <TrendingFutureWidget future={future} maxChoices={FUTURE_CHOICES} />
        )}
      </LoopCarousel>
    </section>
  );
}

/**
 * One quiz card per sport the API covers. It loads on its own, so the rest of
 * the feed does not wait for it, and it stays hidden until the list arrives.
 */
function SportsQuizzes() {
  const sports = useSportsTypes();
  if (!sports.data || sports.data.length === 0) return null;
  return (
    <section aria-labelledby="sports-quiz" className="flex flex-col gap-3">
      <h2
        id="sports-quiz"
        className="font-display text-sm font-black uppercase tracking-display text-cyan"
      >
        Sports Quiz
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {sports.data.map((sport) => (
          <TrendingSportsQuizWidget
            key={sport.sportsType}
            sport={sport.sportsType}
            icon={sport.icon}
          />
        ))}
      </div>
    </section>
  );
}

/** The TRENDING tab. */
export function TrendingFeed() {
  const trending = useTrendingMatches();

  if (!trending.data) {
    return trending.status === "error" ? (
      <FeedError
        subject="trending"
        error={trending.error}
        onRetry={trending.reload}
      />
    ) : (
      <BentoSkeleton />
    );
  }

  return (
    <>
      <TrendingPicks picks={trending.data.trendingPicks} />
      <MatchesSection
        id="trending-matches"
        title="Trending Matches"
        matches={trending.data.clubsAndTeamMatches}
      />
      <TrendingFutures futures={trending.data.trendingFutures} />
      <SportsQuizzes />
      <MatchesSection
        id="more-matches"
        title="More Matches"
        matches={trending.data.trendingMatches}
      />
      <TrendingRaces races={trending.data.trendingRaces} />
      <TrendingQuizzes quizzes={trending.data.trendingQuizzes} />
      <TrendingEvents events={trending.data.trendingEvents} />
      <TrendingPredictions predictions={trending.data.trendingPredictions} />
    </>
  );
}
