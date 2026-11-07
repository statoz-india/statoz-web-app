"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getSignedIn, subscribeSession, type ShopCatalog } from "@/core";
import type { Resource } from "@/hooks/useResource";
import { track } from "@/lib/analytics";
import { Button } from "@/lib/components/button";
import { FilterChips } from "@/lib/components/filter-chips";
import { UnderlineTabs } from "@/lib/components/underline-tabs";
import { accentVar } from "@/styles";

import type { ShopItem } from "../adapters";
import {
  BANNER_PAGE_SIZE,
  usePaidBanners,
  useShopPlayerCards,
  useShopProfilePics,
  useShopTeams,
} from "../data/shop.data";
import { AcquiredOverlay } from "../widgets/acquiredOverlay.widget";
import { BuyDialog } from "../widgets/buyDialog.widget";
import { AvatarTile, BannerTile, CardTile } from "../widgets/shopTiles.widget";

const CYAN = accentVar("cyan");

const TABS = [
  { id: "avatars", label: "AVATARS" },
  { id: "banners", label: "BANNERS" },
  { id: "cards", label: "CARDS" },
];

/** `/shop`: avatars, banners and player cards, one team at a time. */
export function ShopScreen() {
  const router = useRouter();
  const signedIn = useSyncExternalStore(
    subscribeSession,
    getSignedIn,
    () => null,
  );
  const [tab, setTab] = useState(0);
  // A tile tap asks first; a purchase then plays the ACQUIRED overlay.
  const [buying, setBuying] = useState<ShopItem | null>(null);
  const [acquired, setAcquired] = useState<ShopItem | null>(null);

  // Every catalogue needs a session.
  useEffect(() => {
    if (signedIn === false) router.replace("/auth?returnTo=%2Fshop");
  }, [signedIn, router]);

  return (
    <div className="mx-auto w-full max-w-6xl pb-7">
      <UnderlineTabs
        tabs={TABS}
        activeIndex={tab}
        onChange={(index) => {
          if (index !== tab) track("web_shop_tab_selected", { tab: TABS[index].id });
          setTab(index);
        }}
        accent={CYAN}
        label="Shop"
      />
      {signedIn === false ? null : tab === 0 ? (
        <AvatarsTab onBuy={setBuying} />
      ) : tab === 1 ? (
        <BannersTab onBuy={setBuying} />
      ) : (
        <CardsTab onBuy={setBuying} />
      )}
      {buying ? (
        <BuyDialog
          item={buying}
          onClose={() => setBuying(null)}
          onBought={() => {
            setAcquired(buying);
            setBuying(null);
          }}
        />
      ) : null}
      {acquired ? (
        <AcquiredOverlay item={acquired} onClose={() => setAcquired(null)} />
      ) : null}
    </div>
  );
}

function AvatarsTab({ onBuy }: { onBuy: (item: ShopItem) => void }) {
  const [team, teams] = useTeam("profile-pics");
  const items = useShopProfilePics(team);
  return (
    <Catalog teams={teams} team={team} items={items} noun="avatars">
      {(list) => (
        <ul className="grid grid-cols-3 gap-3 min-[30rem]:grid-cols-4 min-[45rem]:grid-cols-5 lg:grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))]">
          {list.map((pic, i) => (
            <li key={pic._id}>
              <AvatarTile
                pic={pic}
                index={i}
                onSelect={() => onBuy({ kind: "avatar", pic })}
              />
            </li>
          ))}
        </ul>
      )}
    </Catalog>
  );
}

/** Every paid banner, all teams; the next page loads as the list's end nears. */
function BannersTab({ onBuy }: { onBuy: (item: ShopItem) => void }) {
  const [pages, setPages] = useState(1);
  const feed = usePaidBanners(pages);
  const banners = feed.resources.flatMap((page) => page.data?.items ?? []);
  const last = feed.resources[feed.resources.length - 1];

  if (!banners.length && last.status !== "ready") {
    return (
      <State
        failed={last.status === "error"}
        noun="banners"
        onRetry={feed.reload}
      />
    );
  }

  return (
    <div className="px-4 pt-3 lg:px-6">
      {banners.length ? (
        <ul className="flex flex-col gap-3">
          {banners.map((banner, i) => (
            <li key={banner._id} className="mx-auto w-full max-w-140">
              {/* Staggered per page, so later pages don't wait behind earlier ones. */}
              <BannerTile
                banner={banner}
                index={i % BANNER_PAGE_SIZE}
                onSelect={() => onBuy({ kind: "banner", banner })}
              />
            </li>
          ))}
        </ul>
      ) : last.data?.hasMore ? null : (
        <Empty noun="banners" />
      )}
      {last.status === "error" ? (
        <State failed noun="banners" onRetry={feed.reload} />
      ) : last.status === "loading" ? (
        <div
          role="status"
          aria-label="Loading more banners"
          className="mx-auto mt-3 h-37 w-full max-w-140 animate-pulse bg-surface-elevated/50"
        />
      ) : last.data?.hasMore ? (
        <OnView onView={() => setPages((p) => p + 1)} />
      ) : null}
    </div>
  );
}

/** Calls `onView` once, when it comes within a screen of the viewport. */
function OnView({ onView }: { onView: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const fire = useEffectEvent(onView);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fire();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden className="h-px" />;
}

function CardsTab({ onBuy }: { onBuy: (item: ShopItem) => void }) {
  const [team, teams] = useTeam("player-cards");
  const items = useShopPlayerCards(team);
  return (
    <Catalog teams={teams} team={team} items={items} noun="cards">
      {(list) => (
        <ul className="grid grid-cols-2 gap-2.5 min-[45rem]:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
          {list.map((card, i) => (
            <li key={card._id}>
              <CardTile
                card={card}
                index={i}
                onSelect={() => onBuy({ kind: "card", card })}
              />
            </li>
          ))}
        </ul>
      )}
    </Catalog>
  );
}

/** A catalogue's team list, and the team picked: the first A–Z until one is tapped. */
function useTeam(catalog: ShopCatalog) {
  const teams = useShopTeams(catalog);
  const [picked, setPicked] = useState<string | null>(null);
  const team = picked ?? teams.data?.[0] ?? null;
  return [team, { ...teams, pick: setPicked }] as const;
}

/** Team chips, then the team's items once both have loaded. */
function Catalog<T>({
  teams,
  team,
  items,
  noun,
  children,
}: {
  teams: Resource<string[]> & {
    reload: () => void;
    pick: (team: string) => void;
  };
  team: string | null;
  items: Resource<T[]> & { reload: () => void };
  noun: string;
  children: (list: T[]) => ReactNode;
}) {
  if (!teams.data) {
    return (
      <State
        failed={teams.status === "error"}
        noun={noun}
        onRetry={teams.reload}
      />
    );
  }
  if (!teams.data.length || team === null) return <Empty noun={noun} />;

  return (
    <>
      <FilterChips
        options={teams.data}
        selected={team}
        onSelect={teams.pick}
        label="Team"
        className="py-1"
      />
      <div className="px-4 pt-2 lg:px-6">
        {items.data ? (
          items.data.length ? (
            children(items.data)
          ) : (
            <Empty noun={noun} />
          )
        ) : (
          <State
            failed={items.status === "error"}
            noun={noun}
            onRetry={items.reload}
          />
        )}
      </div>
    </>
  );
}

function State({
  failed,
  noun,
  onRetry,
}: {
  failed: boolean;
  noun: string;
  onRetry: () => void;
}) {
  return failed ? (
    <div className="grid justify-items-center gap-3 px-4 py-10 text-center">
      <p className="font-sans text-sm text-muted">
        Couldn&apos;t load the {noun}.
      </p>
      <Button variant="tonal" size="sm" onClick={onRetry}>
        TRY AGAIN
      </Button>
    </div>
  ) : (
    <div
      role="status"
      aria-label={`Loading ${noun}`}
      className="mx-4 mt-3 h-80 animate-pulse bg-surface-elevated/50 lg:mx-6"
    />
  );
}

function Empty({ noun }: { noun: string }) {
  return (
    <p className="px-4 py-10 text-center font-display text-xs font-black tracking-label text-muted uppercase">
      No {noun} here yet
    </p>
  );
}
