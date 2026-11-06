/** What the login hero shows: a looping video over a poster, or a still image. */
export type AuthHeroMedia = {
  /** Under `public/`. */
  src: string;
  /** `video` autoplays muted and loops; `image` covers a still or a GIF. */
  kind: "video" | "image";
  /** The frame shown while the video buffers, and in its place if it fails. */
  poster?: string;
  /** For browsers without WebM. */
  mp4Src?: string;
  /** A separate composition below 1024px. */
  mobile?: { src: string; mp4Src?: string; poster?: string };
  /** Leave unset when the media is purely decorative. */
  alt?: string;
};
