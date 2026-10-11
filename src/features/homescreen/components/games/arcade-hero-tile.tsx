"use client";

import { useAuthSession } from "@/features/auth";
import { accentVar, LockIcon } from "@/utils";
import { HudPanel } from "@/widgets/ui/components/hud-panel";

import type { GameTile } from "../../types";
import { useComingSoon } from "./coming-soon-dialog";
import { GameScene } from "./game-scene";

/**
 * Both layouts anchor the scene to the card's right side. `portrait` uses
 * compact typography for narrow bento columns; `landscape` gives the title
 * more room on a full-width deck banner.
 */
export type HeroLayout = "portrait" | "landscape";

export type ArcadeHeroTileProps = {
  game: GameTile;
  layout?: HeroLayout;
};

/**
 * The full-dress arcade tile: a painted scene under a badge, a title, and the
 * verb that names what playing feels like.
 *
 * No game can be played yet, so pressing the tile says so in a popup. A game
 * that is switched off also says why where the call to action would be.
 */
export function ArcadeHeroTile({
  game,
  layout = "portrait",
}: ArcadeHeroTileProps) {
  const session = useAuthSession();
  const accent = accentVar(game.accent);
  const comingSoon = useComingSoon(game.title);
  const landscape = layout === "landscape";
  const guest = game.playable && session.status === "guest";

  return (
    <>
      <HudPanel
        accent={accent}
        glow={game.glow && game.playable}
        onClick={comingSoon.open}
        label={`${game.title}, coming soon`}
      >
        <div
          className={[
            "relative flex flex-col",
            landscape ? "h-44 sm:h-48" : "h-full min-h-40",
            game.playable ? "" : "opacity-55",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {game.scene ? (
            <div
              className={[
                "pointer-events-none absolute inset-y-px right-px",
                landscape ? "w-[48%]" : "w-[68%]",
              ].join(" ")}
            >
              <GameScene scene={game.scene} eager />
            </div>
          ) : null}

          <div
            className={[
              "relative flex flex-col items-start",
              landscape ? "px-4.25 pt-4.25" : "px-3.25 pb-1.5 pt-3.5",
            ].join(" ")}
          >
            {guest ? (
              <span
                className="inline-flex max-w-full items-center gap-1.5 px-1.75 py-1 font-display text-2xs font-black leading-compact"
                style={{
                  color: accent,
                  background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                }}
              >
                <LockIcon size={12} /> LOG IN REQUIRED
              </span>
            ) : game.badgeLabel ? (
              <span
                className="max-w-full truncate px-1.75 py-1 font-display text-2xs font-black leading-compact"
                style={{
                  color: accent,
                  background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                }}
              >
                {game.badgeLabel}
              </span>
            ) : null}

            {/* Landscape keeps the title off the art, as the app does. */}
            <p
              className={[
                "line-clamp-2 font-display font-black uppercase leading-compact",
                landscape
                  ? "mt-auto max-w-[60%] pt-6 text-xl tracking-wide"
                  : "mt-2 w-full text-base tracking-label",
              ].join(" ")}
            >
              {game.title}
            </p>

            {landscape ? (
              <p
                className="mt-1.5 line-clamp-2 max-w-[60%] font-display text-xs font-black uppercase leading-tight"
                style={{ color: accent }}
              >
                {game.subtitle}
              </p>
            ) : null}
          </div>

          <p
            className={[
              "relative mt-auto truncate font-display text-2xs font-black uppercase tracking-wide",
              landscape ? "px-4.25 pb-3.5" : "px-3.25 pb-2.75",
            ].join(" ")}
            style={{ color: `color-mix(in srgb, ${accent} 84%, transparent)` }}
          >
            {!game.playable
              ? game.offlineLabel
              : guest
                ? "LOG IN TO PLAY"
                : game.ctaLabel}
          </p>
        </div>
      </HudPanel>
      {comingSoon.dialog}
    </>
  );
}
