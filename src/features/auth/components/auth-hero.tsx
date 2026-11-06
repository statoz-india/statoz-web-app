"use client";

import Image, { getImageProps } from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";

import { BrandIcon } from "@/lib/icons";
import { accentVar } from "@/styles/colors";

import type { AuthHeroMedia } from "../types";

const MOBILE_QUERY = "(max-width: 1023px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SIZES = "(min-width: 1024px) 53vw, 100vw";

/** `pending` until the browser has answered both media queries. */
type MediaEnv = "pending" | { mobile: boolean; reducedMotion: boolean };

function subscribe(onChange: () => void) {
  const queries = [MOBILE_QUERY, REDUCED_MOTION_QUERY].map((query) =>
    window.matchMedia(query),
  );
  for (const query of queries) query.addEventListener("change", onChange);
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange);
  };
}

// A string snapshot, so React sees the same value until a query changes.
const getSnapshot = () =>
  `${window.matchMedia(MOBILE_QUERY).matches}:${window.matchMedia(REDUCED_MOTION_QUERY).matches}`;
const getServerSnapshot = () => "pending";

function useMediaEnv(): MediaEnv {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  if (snapshot === "pending") return "pending";
  const [mobile, reducedMotion] = snapshot.split(":");
  return { mobile: mobile === "true", reducedMotion: reducedMotion === "true" };
}

export type AuthHeroProps = {
  media: AuthHeroMedia;
  className?: string;
};

export function AuthHero({ media, className }: AuthHeroProps) {
  return (
    <div
      className={["relative isolate overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      style={{ background: "var(--ds-gradient-app-background)" }}
    >
      {media.kind === "video" ? (
        <VideoHero media={media} />
      ) : (
        <ImageHero media={media} />
      )}
    </div>
  );
}

/**
 * The poster paints first, picked by CSS before any script runs. The video
 * fades in over it only once it is actually playing, so a slow, blocked or
 * failed video simply leaves the poster.
 */
function VideoHero({ media }: { media: AuthHeroMedia }) {
  const env = useMediaEnv();
  const videoRef = useRef<HTMLVideoElement>(null);
  // `null` until the visitor presses the button; until then motion settings decide.
  const [wantsVideo, setWantsVideo] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const ready = env !== "pending";
  const mobile = ready && env.mobile && media.mobile;
  const source = mobile ? media.mobile! : media;
  const reducedMotion = ready && env.reducedMotion;
  // With reduced motion the video stays off until asked for (WCAG 2.2.2).
  const videoOn = ready && !failed && (wantsVideo ?? !reducedMotion);

  function togglePlayback() {
    const video = videoRef.current;
    if (!videoOn || !video) {
      setWantsVideo(true);
      return;
    }
    if (video.paused) void video.play();
    else video.pause();
  }

  return (
    <>
      <Poster media={media} />

      {videoOn && (
        <video
          key={`${source.src}:${reducedMotion}`}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
          onLoadStart={() => setPlaying(false)}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        >
          <source
            src={source.src}
            type="video/webm"
            onError={source.mp4Src ? undefined : () => setFailed(true)}
          />
          {source.mp4Src && (
            <source
              src={source.mp4Src}
              type="video/mp4"
              onError={() => setFailed(true)}
            />
          )}
        </video>
      )}

      {ready && !failed && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            playing ? "Pause onboarding animation" : "Play onboarding animation"
          }
          className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-pill border border-line-strong bg-surface-muted px-3 text-xs text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan lg:bottom-3 lg:top-auto"
        >
          <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="currentColor">
            {playing ? (
              <path d="M5 4h3v12H5zm7 0h3v12h-3z" />
            ) : (
              <path d="m6 3 11 7-11 7z" />
            )}
          </svg>
          <span className="hidden lg:inline">{playing ? "Pause" : "Play"}</span>
        </button>
      )}
    </>
  );
}

/** The art-directed poster. It carries the alt text; the video is hidden from assistive tech. */
function Poster({ media }: { media: AuthHeroMedia }) {
  const desktopPoster = media.poster;
  const mobilePoster = media.mobile?.poster ?? media.poster;
  if (!desktopPoster || !mobilePoster) return null;

  const common = { alt: media.alt ?? "", fill: true, sizes: SIZES };
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: mobilePoster });
  const { props } = getImageProps({
    ...common,
    src: desktopPoster,
    priority: true,
  });

  return (
    <picture>
      <source media={MOBILE_QUERY} srcSet={mobileSrcSet} />
      <img {...props} alt={props.alt} className="object-cover" />
    </picture>
  );
}

/** The fallback design for a still or a GIF, with its own glow, fade and logo badge. */
function ImageHero({ media }: { media: AuthHeroMedia }) {
  const cyan = accentVar("cyan");
  return (
    <>
      <Image
        src={media.src}
        alt={media.alt ?? ""}
        fill
        priority
        sizes={SIZES}
        unoptimized={media.src.endsWith(".gif")}
        className="object-cover object-top"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, ${cyan} 16%, transparent), transparent 62%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to top, var(--ds-color-background-secondary), transparent)",
        }}
      />
      <div
        className="absolute left-1/2 top-8 grid size-14 -translate-x-1/2 place-items-center rounded-full"
        style={{
          background: `color-mix(in srgb, ${accentVar("blue")} 28%, var(--ds-color-background-muted))`,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${cyan} 40%, transparent), 0 0 28px color-mix(in srgb, ${cyan} 35%, transparent)`,
        }}
      >
        <BrandIcon name="logo" size={30} />
      </div>
    </>
  );
}
