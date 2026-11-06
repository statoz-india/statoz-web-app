"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useRef, type CSSProperties } from "react";

import { IMAGES } from "@/config/images";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatInt } from "@/utils";

import { itemAccent, itemName, itemPrice, type ShopItem } from "../adapters";
import styles from "../css/acquired.module.css";
import { PlayerCard } from "./playerCard.widget";
import { BannerArt } from "./shopTiles.widget";

/** The overlay closes itself this long after it opens. */
const AUTO_CLOSE_MS = 2200;

/** The dot burst: 26 dots on two rings, from 90ms for 1400ms. */
const BURST = { size: 320, dots: 26, far: 147.2, near: 114.8, delay: 90, length: 1400 };

/**
 * The full-screen moment after a purchase: the item slams in under ACQUIRED,
 * a ring of dots bursts behind it, it shakes once, and its name and price
 * rise under it. A tap, Escape or 2.2s closes it, with no exit animation.
 */
export function AcquiredOverlay({ item, onClose }: { item: ShopItem; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const close = useEffectEvent(onClose);
  const price = itemPrice(item);

  useScrollLock();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => close(), AUTO_CLOSE_MS);
    root.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A canvas can't read `var()`; the custom property's computed value is the colour itself.
    const color = getComputedStyle(element).getPropertyValue("--accent").trim();
    const scale = window.devicePixelRatio || 1;
    element.width = BURST.size * scale;
    element.height = BURST.size * scale;
    ctx.scale(scale, scale);

    const easeOut = (t: number) => {
      // cubic-bezier(0, 0, .58, 1), solved for x by bisection.
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        const x = 3 * (1 - mid) * mid * mid * 0.58 + mid ** 3;
        if (x < t) lo = mid;
        else hi = mid;
      }
      const s = (lo + hi) / 2;
      return 3 * (1 - s) * s * s + s ** 3;
    };

    let frame = 0;
    const start = performance.now() + BURST.delay;
    const draw = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / BURST.length));
      ctx.clearRect(0, 0, BURST.size, BURST.size);
      if (now >= start) {
        ctx.fillStyle = color;
        ctx.globalAlpha = (1 - p) * 0.9;
        const radius = 3.5 + (1 - p) * 3;
        for (let i = 0; i < BURST.dots; i++) {
          const angle = (i / BURST.dots) * Math.PI * 2;
          const distance = easeOut(p) * (i % 2 === 0 ? BURST.far : BURST.near);
          ctx.beginPath();
          ctx.arc(
            BURST.size / 2 + Math.cos(angle) * distance,
            BURST.size / 2 + Math.sin(angle) * distance,
            radius,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
      if (p < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${itemName(item)} acquired`}
      tabIndex={-1}
      onClick={onClose}
      className={`${styles.overlay} fixed inset-0 z-70 grid place-items-center outline-none`}
      style={{ "--accent": itemAccent(item) } as CSSProperties}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2"
      />
      <div className={`${styles.shake} relative flex max-w-[calc(100vw-2rem)] flex-col items-center`}>
        <p className={`${styles.label} font-display text-sm font-black leading-compact tracking-burst`}>
          ACQUIRED
        </p>
        <div className={`${styles.slam} mt-5.5`}>
          <Preview item={item} />
        </div>
        <div className={`${styles.details} mt-6 flex flex-col items-center`}>
          <p
            className={`${styles.name} line-clamp-2 max-w-75 text-center font-display text-headline font-black leading-close tracking-title uppercase`}
          >
            {itemName(item)}
          </p>
          {/* Only a coin purchase shows what it cost; a free item cost nothing. */}
          {price > 0 && (
            <p className="ds-tabular mt-3.5 flex items-center gap-1.5 font-display text-badge font-black leading-compact text-muted">
              <Image src={IMAGES.icons.ozCoins} alt="" width={18} height={18} className="shrink-0" />
              −{formatInt(price)}
            </p>
          )}
        </div>
      </div>
      <p
        className={`${styles.continue} absolute inset-x-0 bottom-12 text-center font-display text-xs font-black leading-compact tracking-span text-muted`}
      >
        TAP TO CONTINUE
      </p>
    </div>
  );
}

function Preview({ item }: { item: ShopItem }) {
  if (item.kind === "card") return <PlayerCard card={item.card} selected />;
  return (
    <div className={`${styles.frame} ${item.kind === "avatar" ? "h-37.5 w-30" : "h-24 w-60"}`}>
      <div className={styles.frameFill}>
        {item.kind === "avatar" ? (
          <Image
            src={item.pic.ppUrl}
            alt=""
            fill
            unoptimized
            sizes="120px"
            className="object-cover object-top"
          />
        ) : (
          <BannerArt banner={item.banner} />
        )}
      </div>
    </div>
  );
}
