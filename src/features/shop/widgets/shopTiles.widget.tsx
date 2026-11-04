import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { IMAGES } from "@/config/images";
import { isSport } from "@/config/sports";
import type { PaidProfileBanner, ShopPlayerCard, ShopProfilePic } from "@/core";
import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  MotorsportIcon,
} from "@/lib/icons";
import { accentVar } from "@/styles";
import { formatInt } from "@/utils";

import {
  CARD_TILE_ACCENT,
  rarityOf,
  sportAccent,
  sportTag,
} from "../adapters";
import styles from "../css/shop.module.css";
import { PlayerCard } from "./playerCard.widget";

const SPORT_ICONS = {
  football: FootballIcon,
  cricket: CricketIcon,
  basketball: BasketballIcon,
  racing: MotorsportIcon,
};

/** The frame every tile shares; `index` staggers its entrance. */
function Tile({
  accent,
  index,
  className,
  children,
}: {
  accent: string;
  index: number;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${styles.tile} ${className}`}
      style={{ "--accent": accent, "--delay": `${index * 22}ms` } as CSSProperties}
    >
      <div className={styles.fill}>{children}</div>
    </div>
  );
}

/** The price rail; a free item says FREE in the tile's accent. */
function Price({ value, size }: { value: number; size: "sm" | "md" }) {
  return (
    <div className={styles.rail}>
      {value === 0 ? (
        <span
          className="font-display text-2xs font-black tracking-wide"
          style={{ color: "var(--accent)" }}
        >
          FREE
        </span>
      ) : (
        <span className="flex items-center gap-1.25">
          <Image
            src={IMAGES.icons.ozCoins}
            alt="Oz"
            width={size === "sm" ? 12 : 13}
            height={size === "sm" ? 12 : 13}
          />
          <span
            className={`ds-tabular font-display font-black leading-compact ${size === "sm" ? "text-xs" : "text-compact"}`}
          >
            {formatInt(value)}
          </span>
        </span>
      )}
    </div>
  );
}

export function AvatarTile({ pic, index }: { pic: ShopProfilePic; index: number }) {
  return (
    <Tile accent={accentVar("cyan")} index={index} className="aspect-[0.6]">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden">
        <Image
          src={pic.ppUrl}
          alt=""
          fill
          unoptimized
          sizes="160px"
          className="object-cover object-top"
        />
      </div>
      <p className="flex min-h-0 flex-1 items-center justify-center px-2.5 pb-2">
        <span className="truncate font-display text-xs font-extrabold leading-compact tracking-label uppercase">
          {pic.ppName}
        </span>
      </p>
      <Price value={pic.coinValue} size="sm" />
    </Tile>
  );
}

export function BannerTile({
  banner,
  index,
}: {
  banner: PaidProfileBanner;
  index: number;
}) {
  const Icon = isSport(banner.sport) ? SPORT_ICONS[banner.sport] : FootballIcon;
  return (
    <Tile accent={sportAccent(banner.sport)} index={index} className="h-37">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {banner.pbUrl ? (
          <Image
            src={banner.pbUrl}
            alt=""
            fill
            unoptimized
            sizes="560px"
            className="object-cover"
          />
        ) : (
          // Painted art: a base wash, mesh, slashes, a burst and the sport crest.
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, color-mix(in srgb, var(--accent) 30%, var(--ds-color-background-primary)), var(--ds-color-background-primary))",
            }}
          >
            <div className={styles.mesh} />
            <div className={styles.slashes} />
            <div className={styles.burst} />
            <div className={styles.crest}>
              <Icon size={34} />
            </div>
          </div>
        )}
        <span
          className="absolute top-0 left-0 border px-1.5 py-0.5 font-display text-nano font-black tracking-wide"
          style={{
            color: "var(--accent)",
            borderColor: "color-mix(in srgb, var(--accent) 55%, transparent)",
            background: "color-mix(in srgb, var(--accent) 18%, transparent)",
          }}
        >
          {sportTag(banner.sport)}
        </span>
      </div>
      <p className="truncate px-2.5 py-2 text-center font-display text-xs font-extrabold leading-compact tracking-label uppercase">
        {banner.pbName}
      </p>
      <Price value={banner.coinValue} size="sm" />
    </Tile>
  );
}

export function CardTile({ card, index }: { card: ShopPlayerCard; index: number }) {
  return (
    <Tile
      accent={CARD_TILE_ACCENT[rarityOf(card.cardType)]}
      index={index}
      className="aspect-[0.68]"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center px-1 pt-0.5 pb-1">
        <PlayerCard card={card} />
      </div>
      <Price value={card.coinValue} size="md" />
    </Tile>
  );
}
