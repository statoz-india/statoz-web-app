import Image from "next/image";

import { IMAGES } from "@/utils/imageConstant";

/**
 * Multi-color brand artwork from the app's `assets/icons`. These carry their
 * own palette, so unlike the currentColor icons in `components/layouts/nav`
 * they are served as images rather than inlined and tinted.
 */
export const brandAssets = {
  coin: { src: IMAGES.icons.coin, alt: "Coin" },
  ozCoins: { src: IMAGES.icons.ozCoins, alt: "Oz coins" },
  streak: { src: IMAGES.icons.streak, alt: "Streak flame" },
  logo: { src: IMAGES.icons.appLogo, alt: "StatOz" },
} as const;

export type BrandAssetName = keyof typeof brandAssets;

export type BrandIconProps = {
  name: BrandAssetName;
  size?: number;
  alt?: string;
  className?: string;
  preload?: boolean;
};

/**
 * Renders one of the brand artwork assets at a square size. Some artwork is
 * not square (the coins are 21×20), so the box is pinned to 1:1 and the art is
 * contained within it rather than letting `height: auto` reshape the image.
 */
export function BrandIcon({
  name,
  size = 18,
  alt,
  className,
  preload,
}: BrandIconProps) {
  const asset = brandAssets[name];
  const resolved = alt ?? asset.alt;

  return (
    <Image
      src={asset.src}
      alt={resolved}
      width={size}
      height={size}
      className={["aspect-square object-contain", className]
        .filter(Boolean)
        .join(" ")}
      preload={preload}
      aria-hidden={resolved === "" ? true : undefined}
    />
  );
}

export type GoogleMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Google's "G". Inlined rather than served from `assets/icons` because the app
 * ships no Google artwork, and like the brand assets above it keeps its own
 * palette instead of taking `currentColor`.
 */
export function GoogleMark({ size = 18, className }: GoogleMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path
        fill="#ffc107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#ff3d00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4caf50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976d2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
