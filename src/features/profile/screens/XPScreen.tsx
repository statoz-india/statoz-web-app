"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthUser } from "@/core";
import { Button } from "@/lib/components/button";
import { BackButton } from "@/lib/screens/howToPlay/back-button";
import { todayInIST, toISTDate } from "@/utils";

import { signedXp, toProfile, xpSeries, xpTrack } from "../adapters";
import {
  useProfileUser,
  useXpCounts,
  useXpFeed,
  useXpMap,
  type XpFilter,
} from "../data/profile.data";
import {
  XpChips,
  XpEntryRow,
  XpHistoryCard,
  XpLevelCard,
  XpTotals,
} from "../widgets/xp.widget";

const TYPES: { id: string; label: string; filter: XpFilter }[] = [
  { id: "all", label: "ALL", filter: {} },
  { id: "earned", label: "EARNED", filter: { xpType: "CREDITED" } },
  { id: "lost", label: "LOST", filter: { xpType: "DEBITED" } },
  { id: "games", label: "GAMES", filter: { xpSource: "GAME" } },
  { id: "predictions", label: "PREDICTIONS", filter: { xpSource: "TOURNAMENT" } },
];

/** `/profile/xp`: the player's level, XP history and every XP change. */
export function XPScreen() {
  const router = useRouter();
  const { signedIn, user } = useProfileUser();

  useEffect(() => {
    if (signedIn === false) router.replace("/auth?returnTo=%2Fprofile%2Fxp");
  }, [signedIn, router]);

  return (
    <div className="w-full">
      <header className="mx-auto flex min-h-14 w-full max-w-288 items-center gap-1 pt-2 pr-4 pl-2 lg:pt-3.5">
        <BackButton fallback="/profile" />
        <h1 className="truncate font-display text-xl font-black leading-compact tracking-label text-cyan">
          XP PROGRESS
        </h1>
      </header>
      {user.data && signedIn !== false ? (
        // Keyed, so the next player starts from their own filters.
        <XpView key={user.data._id} user={user.data} />
      ) : user.status === "error" && signedIn !== false ? (
        <Failed message="Couldn't load your XP." onRetry={user.reload} />
      ) : (
        <div
          role="status"
          aria-label="Loading your XP"
          className="mx-4 mt-3 h-80 animate-pulse bg-surface-elevated/50 lg:mx-auto lg:max-w-288"
        />
      )}
    </div>
  );
}

function XpView({ user }: { user: AuthUser }) {
  const [typeId, setTypeId] = useState("all");
  const [track, setTrack] = useState<string | null>(null);
  const [pages, setPages] = useState(1);
  const type = TYPES.find((t) => t.id === typeId) ?? TYPES[0];

  const counts = useXpCounts(TYPES.map((t) => t.filter));
  const feed = useXpFeed(type.filter, pages);
  const map = useXpMap();

  const entries = feed.resources.flatMap((page) => page.data?.items ?? []);
  const last = feed.resources[feed.resources.length - 1];
  const tracks = new Map<string, number>();
  for (const entry of entries) {
    const { label } = xpTrack(entry);
    tracks.set(label, (tracks.get(label) ?? 0) + 1);
  }
  const shown = track
    ? entries.filter((entry) => xpTrack(entry).label === track)
    : entries;
  const sum = (list: typeof shown) => list.reduce((a, e) => a + e.xp, 0);
  const earned = sum(shown.filter((e) => e.xpType === "CREDITED"));
  const lost = sum(shown.filter((e) => e.xpType === "DEBITED"));

  // The map only has days, so DAY plots today's changes from the newest page.
  const series = map.data
    ? (() => {
        const today = todayInIST();
        const changes = (counts.resources[0].data?.items ?? [])
          .filter((e) => toISTDate(new Date(e.date)) === today)
          .reverse()
          .map(signedXp);
        return xpSeries(map.data.points, today, changes);
      })()
    : null;

  const noXp = counts.resources[0].data?.total === 0;

  return (
    <div className="mx-auto grid w-full max-w-288 gap-3 px-4 pt-3 pb-7 max-[24rem]:px-3 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(31rem,1.22fr)] lg:gap-x-5 lg:gap-y-4 lg:pt-5">
      <div className="lg:col-start-1 lg:row-start-1">
        <XpLevelCard level={toProfile(user).level} />
      </div>
      <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1">
        <XpHistoryCard
          series={series}
          failed={map.status === "error"}
          onRetry={map.reload}
        />
      </div>
      <div className="lg:col-start-1 lg:row-start-2">
        <XpTotals earned={earned} lost={lost} />
      </div>
      <div className="min-w-0 lg:col-start-1 lg:row-start-3">
        <XpChips
          label="Type"
          chips={TYPES.map((t, i) => ({
            id: t.id,
            label: t.label,
            count: counts.resources[i].data?.total,
          }))}
          active={type.id}
          onSelect={(id) => {
            setTypeId(id);
            setTrack(null);
            setPages(1);
          }}
        />
        {tracks.size ? (
          <div className="mt-2.5">
            <XpChips
              label="Track"
              chips={[...tracks].map(([label, count]) => ({ id: label, label, count }))}
              active={track}
              onSelect={(id) => setTrack((current) => (current === id ? null : id))}
            />
          </div>
        ) : null}
      </div>

      <section aria-label="XP activity" className="lg:col-span-2 lg:row-start-4">
        {shown.length ? (
          <ul className="grid gap-2.5 lg:grid-cols-2">
            {shown.map((entry) => (
              <XpEntryRow key={entry._id} entry={entry} />
            ))}
          </ul>
        ) : last.status === "loading" ? (
          <div
            role="status"
            aria-label="Loading XP activity"
            className="h-40 animate-pulse bg-surface-elevated/50"
          />
        ) : last.status === "ready" ? (
          <p className="p-7 text-center font-sans text-sm leading-body text-muted">
            {noXp
              ? "No XP activity yet. Play a match, make a prediction, or open a pack."
              : "No XP changes match this filter."}
          </p>
        ) : null}

        {last.status === "error" ? (
          <Failed message="Couldn't load your XP activity." onRetry={feed.reload} />
        ) : (
            // A page that's loading after earlier ones keeps the button, pending.
            last.status === "loading" ? entries.length > 0 : last.data?.hasMore
          ) ? (
          <div className="mt-3 flex justify-center">
            <Button
              variant="tonal"
              pending={last.status === "loading"}
              onClick={() => setPages((p) => p + 1)}
            >
              LOAD MORE
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Failed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid justify-items-center gap-3 px-4 py-7 text-center">
      <p className="font-sans text-sm text-muted">{message}</p>
      <Button variant="tonal" size="sm" onClick={onRetry}>
        TRY AGAIN
      </Button>
    </div>
  );
}
