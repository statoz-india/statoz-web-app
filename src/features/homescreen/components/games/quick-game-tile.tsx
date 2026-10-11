"use client";

import type { ReactElement } from "react";

import { useAuthSession } from "@/features/auth";
import {
  accentVar,
  GameIcon,
  GridViewIcon,
  LockIcon,
  PersonSearchIcon,
  QuizIcon,
  type IconProps,
} from "@/utils";
import { HudPanel } from "@/widgets/ui/components/hud-panel";

import type { GameSceneId, GameTile } from "../../types";
import { SportIcon } from "../sport-icon";
import { useComingSoon } from "./coming-soon-dialog";
import { GameScene } from "./game-scene";

/**
 * The glyph each format is identified by, keyed off the scene rather than the
 * game — five sports run the same quiz and it wears the same mark in each. A
 * game outside these formats wears its sport's glyph.
 */
const icons: Partial<Record<GameSceneId, (props: IconProps) => ReactElement>> =
  {
    quiz: QuizIcon,
    bingo: GridViewIcon,
    "guess-player": PersonSearchIcon,
    "guess-driver": PersonSearchIcon,
    "guess-winner": PersonSearchIcon,
  };

export type QuickGameTileProps = {
  game: GameTile;
};

/**
 * The compact arcade plate: the game's glyph as a boxed mark, over its scene
 * run faintly as a watermark rather than shown outright. Quick games stay
 * quieter than the arcade heroes — the scene is texture here, not the subject.
 *
 * No game can be played yet, so pressing the plate says so in a popup.
 */
export function QuickGameTile({ game }: QuickGameTileProps) {
  const session = useAuthSession();
  const accent = accentVar(game.accent);
  const comingSoon = useComingSoon(game.title);
  const Glyph = game.scene ? icons[game.scene] : undefined;
  const guest = game.playable && session.status === "guest";

  return (
    <>
      <HudPanel
        accent={accent}
        onClick={comingSoon.open}
        label={`${game.title}, coming soon`}
      >
        <div
          className={[
            "relative flex h-full min-h-40 flex-col p-3.25",
            game.playable ? "" : "opacity-55",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            background: `color-mix(in srgb, ${accent} 5.5%, var(--ds-color-background-elevated))`,
          }}
        >
          {/* Bled off the bottom-right corner, the way the glyph mark used to be. */}
          {game.scene ? (
            <div className="pointer-events-none absolute -bottom-4 -right-5 h-4/5 w-3/5">
              <GameScene scene={game.scene} washed={false} />
            </div>
          ) : null}

          {/* The one bright line on the plate, stopping short of the notch. */}
          <span
            aria-hidden
            className="absolute left-3.5 right-8.5 top-0 h-0.5"
            style={{
              background: `color-mix(in srgb, ${accent} 82%, transparent)`,
            }}
          />

          <div className="relative flex items-start justify-between gap-2">
            <span
              className="grid size-10 shrink-0 place-items-center border"
              style={{
                color: accent,
                borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
                background:
                  "color-mix(in srgb, var(--ds-color-background-primary) 55%, transparent)",
              }}
            >
              {Glyph ? (
                <Glyph size={22} />
              ) : game.sport ? (
                <SportIcon sport={game.sport} size={22} />
              ) : (
                <GameIcon size={22} />
              )}
            </span>

            <span
              className="inline-flex items-center gap-1.25 px-1.75 py-1 font-display text-2xs font-black leading-compact"
              style={{
                color: accent,
                background: `color-mix(in srgb, ${accent} 14%, transparent)`,
              }}
            >
              {guest ? <LockIcon size={12} /> : null}
              <span
                aria-hidden
                className="size-1.25 rounded-pill"
                style={{ background: accent }}
              />
              {!game.playable ? "SOON" : guest ? "LOG IN" : "FREE"}
            </span>
          </div>

          <p className="relative mt-3 line-clamp-2 font-display text-sm font-black uppercase leading-compact tracking-label">
            {game.title}
          </p>

          <p
            className="relative mt-1.25 line-clamp-2 text-2xs font-semibold uppercase leading-tight tracking-wide"
            style={{ color: `color-mix(in srgb, ${accent} 76%, transparent)` }}
          >
            {game.playable ? game.subtitle : game.offlineLabel}
          </p>
        </div>
      </HudPanel>
      {comingSoon.dialog}
    </>
  );
}
