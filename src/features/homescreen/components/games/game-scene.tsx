import Image from "next/image";

import { IMAGES } from "@/config/images";

import type { GameSceneId } from "../../types";

/* -------------------------------------------------------------------------
 * Game scenes
 *
 * The illustrations behind the arcade tiles, served from `public/assets/games`.
 * Formats that repeat across sports — the quizzes, the mystery games — share
 * one drawing rather than carrying near-identical files.
 *
 * These carry their own palette, so — like the brand artwork in
 * `utils/icons/brand.tsx` — they are images rather than inlined and tinted. An
 * SVG loaded through `<img>` is its own document and cannot read the page's
 * custom properties, so the accents inside each file are the token values
 * written out.
 *
 * Every file shares one viewBox, cropped to the art, so the scenes are
 * interchangeable and position identically.
 * ---------------------------------------------------------------------- */

const sceneAssets: Record<GameSceneId, string> = {
  "pitch-duel": IMAGES.games.pitchDuel,
  "penalty-shootout": IMAGES.games.penaltyShootout,
  "football-chess": IMAGES.games.footballChess,
  "final-over": IMAGES.games.finalOver,
  "hoop-duel": IMAGES.games.hoopDuel,
  "grand-prix-dash": IMAGES.games.grandPrixDash,
  "tennis-rally": IMAGES.games.tennisRally,
  quiz: IMAGES.games.quiz,
  bingo: IMAGES.games.bingo,
  "guess-player": IMAGES.games.guessPlayer,
  "guess-driver": IMAGES.games.guessDriver,
  "guess-winner": IMAGES.games.guessWinner,
};

/** Where each scene's wash lands at the right edge, before the fade. */
const wash: Record<GameSceneId, string> = {
  "pitch-duel": "#0a2a34",
  "penalty-shootout": "#0b2b39",
  "football-chess": "#0b2b39",
  "final-over": "#0b2b39",
  "hoop-duel": "#2c260d",
  "grand-prix-dash": "#361321",
  "tennis-rally": "#1b3f55",
  quiz: "#241a33",
  bingo: "#2f2109",
  "guess-player": "#301a26",
  "guess-driver": "#301a26",
  "guess-winner": "#0b2b39",
};

export type GameSceneProps = {
  scene: GameSceneId;
  /** Card artwork defaults to 60%; other surfaces may override it. */
  opacity?: number;
  /** Lays the accent wash under the art. Off for watermark use. */
  washed?: boolean;
  /** Loads the art at once, for a scene that is the subject of its tile. */
  eager?: boolean;
};

/**
 * The painted backdrop for a game: an accent wash that fades in from the left,
 * and the illustration pinned to the right at the band's full height.
 *
 * Fitting rather than filling is what keeps a wide tile honest — its scene band
 * is barely a third as tall as it is wide, and filling would scale the art to
 * the width and crop away everything but a stripe.
 */
export function GameScene({
  scene,
  opacity = 0.6,
  washed = true,
  eager = false,
}: GameSceneProps) {
  return (
    <>
      {washed ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, transparent 36%, color-mix(in srgb, ${wash[scene]} 82%, transparent) 100%)`,
          }}
        />
      ) : null}
      <Image
        src={sceneAssets[scene]}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1024px) 20vw, 50vw"
        loading={eager ? "eager" : "lazy"}
        className="pointer-events-none select-none object-contain object-right"
        style={{ opacity }}
      />
    </>
  );
}
