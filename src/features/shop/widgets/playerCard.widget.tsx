import Image from "next/image";
import type { CSSProperties } from "react";

import type { ShopPlayerCard } from "@/core";
import { cardCuts, rarityFoil, type RarityName } from "@/styles";

import { cardRole, rarityOf } from "../adapters";
import styles from "../css/shop.module.css";

const WHITE = "var(--ds-color-text-default)";
const PAGE = "var(--ds-color-background-primary)";
const rarityColor = (tier: RarityName) => `var(--ds-color-rarity-${tier}-base)`;

/** Edge width, edge gradient, edge opacity at rest and on hover, pips filled. */
const TIERS: Record<
  RarityName,
  { width: number; edge: string; rest: number; hover: number; pips: number }
> = {
  bronze: {
    width: 1,
    edge: whiteInto("bronze", 15),
    rest: 0.5,
    hover: 0.8,
    pips: 1,
  },
  silver: {
    width: 1.45,
    edge: whiteInto("silver", 32),
    rest: 0.62,
    hover: 0.92,
    pips: 2,
  },
  gold: {
    width: 1.9,
    edge: whiteInto("gold", 49),
    rest: 0.74,
    hover: 1,
    pips: 3,
  },
  platinum: {
    width: 2.35,
    edge: `linear-gradient(135deg, ${WHITE}, ${rarityColor("platinum")}, var(--ds-color-rarity-platinum-deep))`,
    rest: 0.86,
    hover: 1,
    pips: 4,
  },
};

function whiteInto(tier: RarityName, percent: number) {
  const color = rarityColor(tier);
  return `linear-gradient(135deg, color-mix(in srgb, ${WHITE} ${percent}%, ${color}), ${color})`;
}

const { big, small } = cardCuts(128);
const BADGE_CLIP =
  "polygon(7.68px 0, calc(100% - 2.56px) 0, 100% 2.56px, 100% calc(100% - 7.68px), calc(100% - 7.68px) 100%, 2.56px 100%, 0 calc(100% - 2.56px), 0 7.68px)";

/** The 128 × 192 collectible: portrait, role, rating and nameplate. */
export function PlayerCard({ card }: { card: ShopPlayerCard }) {
  const tier = rarityOf(card.cardType);
  const { width, edge, rest, hover, pips } = TIERS[tier];
  const color = rarityColor(tier);
  const role = cardRole(card.position, card.trait);
  const bright = tier === "gold" || tier === "platinum";
  const style = {
    "--ds-card-cut-big": `${big}px`,
    "--ds-card-cut-small": `${small}px`,
    "--rarity": color,
    "--edge-rest": rest,
    "--edge-hover": hover,
  } as CSSProperties;

  return (
    <div className={`${styles.card} relative h-48 w-32 shrink-0`} style={style}>
      <div
        aria-hidden
        className={styles.glow}
        style={{ clipPath: "var(--ds-clip-card)" }}
      />
      <div
        aria-hidden
        className={`${styles.edge} absolute inset-0`}
        style={{ clipPath: "var(--ds-clip-card)", background: edge }}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          inset: width,
          clipPath: "var(--ds-clip-card)",
          background: `repeating-linear-gradient(135deg, color-mix(in srgb, ${color} 11%, transparent) 0 1px, transparent 1px 12.73px), ${rarityFoil[tier]}`,
        }}
      >
        <div className="absolute inset-x-1 top-1 bottom-[24%] overflow-hidden">
          <Image
            src={card.image}
            alt=""
            fill
            unoptimized
            sizes="128px"
            className="object-cover object-top"
          />
        </div>

        <div className="absolute top-2.5 left-[7.5px] max-w-[56%] bg-(--ds-color-overlay-plate) px-1.5 py-0.5">
          <p
            className="truncate font-display text-2xs font-black leading-compact"
            style={{ color: role.color }}
          >
            {role.label}
          </p>
          <p className="mt-0.5 font-sans text-2xs font-bold leading-compact text-foreground/70">
            {card.teamAbbreviation}
          </p>
        </div>

        <div
          className="absolute top-0 right-0 flex h-9.75 w-11.5 flex-col items-center justify-center text-inverse"
          style={{
            clipPath: BADGE_CLIP,
            background: `linear-gradient(to bottom, color-mix(in srgb, ${WHITE} ${bright ? 60 : 30}%, ${color}), color-mix(in srgb, ${color}, ${PAGE} ${tier === "bronze" ? 45 : 18}%))`,
          }}
        >
          <span className="ds-tabular font-display text-base font-black leading-compact">
            {card.finalRating}
          </span>
          <span aria-hidden className="my-0.5 h-px w-4.5 bg-inverse/40" />
          <span className="font-display text-2xs font-black leading-compact tracking-label">
            OVR
          </span>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 flex h-[24%] flex-col items-center justify-center border-l-2 px-2"
          style={{
            background: "var(--ds-gradient-card-nameplate)",
            borderColor: `color-mix(in srgb, ${color} 90%, transparent)`,
          }}
        >
          <span aria-label={`${pips} of 4`} className="flex gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="size-1 rounded-pill"
                style={
                  i < pips
                    ? { background: color }
                    : {
                        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 45%, transparent)`,
                      }
                }
              />
            ))}
          </span>
          <span className="mt-1 w-full truncate text-center font-display text-xs font-black leading-compact uppercase">
            {card.name}
          </span>
        </div>
      </div>
    </div>
  );
}
