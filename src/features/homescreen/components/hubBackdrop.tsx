import type { CSSProperties } from "react";

import { IMAGES } from "@/config/images";

import styles from "../css/hubBackdrop.module.css";

export const HUB_THEMES = [
  "trending",
  "football",
  "cricket",
  "basketball",
  "motorsport",
] as const;
export type HubTheme = (typeof HUB_THEMES)[number];

const HUB_ART = IMAGES.backgrounds.hub;

/**
 * The art behind the home hub: the app gradient, the active theme's diorama,
 * and a veil that keeps the cards readable. Every theme is mounted, so all the
 * images load once and switching sport is only a crossfade.
 */
export function HubBackdrop({ theme }: { theme: HubTheme }) {
  return (
    <div
      aria-hidden
      className={styles.backdrop}
      style={
        { "--hub-overlay": `url("${HUB_ART.cyberOverlay}")` } as CSSProperties
      }
    >
      {HUB_THEMES.map((name) => (
        <div
          key={name}
          className={styles.artwork}
          data-active={theme === name}
          style={
            {
              "--hub-portrait": `url("${HUB_ART[name].portrait}")`,
              "--hub-wide": `url("${HUB_ART[name].wide}")`,
            } as CSSProperties
          }
        />
      ))}
      <div className={styles.veil} />
    </div>
  );
}
