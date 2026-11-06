import { IMAGES } from "@/config/images";

import type { AuthHeroMedia } from "./types";

/**
 * About six seconds each, framed separately for desktop and phones rather
 * than one clip cropped two ways.
 */
export const authHeroMedia: AuthHeroMedia = {
  kind: "video",
  src: "/assets/backgrounds/onboarding/desktop.webm",
  mp4Src: "/assets/backgrounds/onboarding/desktop.mp4",
  poster: IMAGES.backgrounds.onboarding.desktopPoster,
  mobile: {
    src: "/assets/backgrounds/onboarding/mobile.webm",
    mp4Src: "/assets/backgrounds/onboarding/mobile.mp4",
    poster: IMAGES.backgrounds.onboarding.mobilePoster,
  },
  alt: "Messi, Ronaldo, Virat Kohli, Lewis Hamilton and LeBron James. StatOz: One arena. Every game.",
};
