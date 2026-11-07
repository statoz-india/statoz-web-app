"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { IMAGES } from "@/config/images";
import { useCurrentUser } from "@/features/auth";
import { useScrollLock } from "@/hooks/useScrollLock";
import { track } from "@/lib/analytics";
import { Button } from "@/lib/components/button";
import { ArrowRightIcon } from "@/lib/icons";
import { withAlpha } from "@/styles";
import { formatInt } from "@/utils";

import { itemAccent, itemName, itemParams, itemPrice, type ShopItem } from "../adapters";
import { buyItem } from "../data/shop.data";
import { BannerArt } from "./shopTiles.widget";

const NOUN: Record<ShopItem["kind"], string> = {
  avatar: "AVATAR",
  banner: "BANNER",
  card: "CARD",
};

/**
 * Asks before coins are spent. Confirming buys the item; a failure stays in
 * the dialog with its reason, and a success hands over to `onBought`.
 */
export function BuyDialog({
  item,
  onBought,
  onClose,
}: {
  item: ShopItem;
  onBought: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [buying, setBuying] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const price = itemPrice(item);
  const accent = itemAccent(item);
  const balance = useCurrentUser()?.coins ?? null;
  // Unknown balance lets the tap through; the API has the final say.
  const short = balance === null ? 0 : Math.max(0, price - balance);

  useScrollLock();
  // A modal <dialog>: Escape, the focus trap and stacking come from the browser.
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    track("web_view_item", itemParams(item));
  }, [item]);

  return (
    <dialog
      ref={ref}
      aria-label={`Buy ${itemName(item)}`}
      onCancel={(event) => {
        event.preventDefault();
        if (!buying) onClose();
      }}
      // The panel fills the dialog, so only a press on the backdrop lands here.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !buying) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-90 bg-transparent p-0 text-foreground backdrop:bg-(--ds-color-overlay-scrim)"
    >
      <div
        className="flex flex-col gap-4 p-5"
        style={{
          clipPath: "var(--ds-clip-panel)",
          background: "var(--ds-gradient-hud-sheet)",
        }}
      >
        <div className="flex items-center gap-4">
          <Thumb item={item} accent={accent} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="font-display text-2xs font-black tracking-ultra" style={{ color: accent }}>
              BUY {NOUN[item.kind]}
            </h2>
            <p className="truncate font-grotesk text-badge font-bold leading-tight">{itemName(item)}</p>
            <p className="ds-tabular flex items-center gap-1.5 font-display text-md font-black">
              {price === 0 ? (
                <span style={{ color: accent }}>FREE</span>
              ) : (
                <>
                  <Image src={IMAGES.icons.ozCoins} alt="" width={16} height={16} className="shrink-0" />
                  {formatInt(price)}
                </>
              )}
            </p>
          </div>
        </div>
        {balance !== null && price > 0 ? (
          <p className="ds-tabular flex items-center justify-between gap-3 border-t border-line pt-3.5 font-display text-2xs font-black tracking-ultra text-muted">
            BALANCE
            <span className="flex items-center gap-1.5 text-xs text-foreground">
              {formatInt(balance)}
              {short > 0 ? (
                <span className="ml-1.5 text-orange">NEED {formatInt(short)} MORE</span>
              ) : (
                <>
                  <ArrowRightIcon size={14} aria-label="after buying" className="text-muted" />
                  {formatInt(balance - price)}
                </>
              )}
            </span>
          </p>
        ) : null}
        {failure ? (
          <p role="alert" className="font-grotesk text-xs font-bold text-orange">
            {failure}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="tonal" size="md" fullWidth disabled={buying} onClick={onClose}>
            CANCEL
          </Button>
          <Button
            variant="solid"
            size="md"
            fullWidth
            accent={accent}
            disabled={short > 0}
            pending={buying}
            onClick={async () => {
              setBuying(true);
              setFailure(null);
              const failed = await buyItem(item);
              setBuying(false);
              if (failed) setFailure(failed);
              else onBought();
            }}
          >
            {price === 0 ? "GET IT FREE" : "BUY"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

/** The item's picture in a frame tinted with its accent, shaped like the item. */
function Thumb({ item, accent }: { item: ShopItem; accent: string }) {
  const frame =
    item.kind === "avatar" ? "size-18" : item.kind === "banner" ? "h-18 w-32" : "h-18 w-13";
  return (
    <div
      className={`relative shrink-0 overflow-hidden border ${frame}`}
      style={
        {
          "--accent": accent,
          borderColor: withAlpha(accent, 0.45),
          background: `color-mix(in srgb, ${accent} 12%, var(--ds-color-background-secondary))`,
        } as CSSProperties
      }
    >
      {item.kind === "banner" ? (
        <BannerArt banner={item.banner} />
      ) : (
        <Image
          src={item.kind === "avatar" ? item.pic.ppUrl : item.card.image}
          alt=""
          fill
          unoptimized
          sizes="72px"
          className="object-cover object-top"
        />
      )}
    </div>
  );
}
