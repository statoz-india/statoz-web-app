"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  type ComponentType,
  type CSSProperties,
} from "react";

import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  iconRegistry,
  MotorsportIcon,
  type GlyphName,
} from "@/lib/icons";

import styles from "./trendingSportsQuiz.widget.module.css";

/** One pose of an art layer. `x` and `y` are in the scene's 220×160 units. */
export type QuizArtFrame = {
  /** Where in the loop, 0 to 1. */
  at: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
};

export type QuizArtLayer = {
  id: string;
  /** From `IMAGES` in `@/config/images`. */
  src: string;
  /** Motion keyframes. Without them the layer stays still. */
  frames?: QuizArtFrame[];
};

/** The art loop's length, and the pose shown when it is not running. */
const CYCLE_MS = 4800;
const STILL_PHASE = 0.28;

/** The football quiz's pivot, in percent of the scene. */
export const FOOTBALL_QUIZ_PIVOT: [number, number] = [130 / 2.2, 94 / 1.6];

/** The football quiz's action layer: a slow swell to 103.5% and back. */
export const FOOTBALL_QUIZ_ACTION_FRAMES: QuizArtFrame[] = [
  { at: 0, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { at: 0.12, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { at: 0.4, x: 0, y: 0, rotate: 0, scale: 1.035, opacity: 1 },
  { at: 0.68, x: 0, y: 0, rotate: 0, scale: 1.035, opacity: 1 },
  { at: 0.88, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { at: 1, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
];

type SportLook = {
  accent: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const SPORTS: Record<string, SportLook> = {
  football: { accent: "var(--ds-color-accent-cyan)", icon: FootballIcon },
  cricket: { accent: "var(--ds-color-accent-white)", icon: CricketIcon },
  basketball: { accent: "var(--ds-color-accent-gold)", icon: BasketballIcon },
  racing: { accent: "var(--ds-color-accent-racing)", icon: MotorsportIcon },
};

/** The size of the icon that stands in for missing quiz art. */
const ART_ICON_SIZE = 56;

/** Whether the API's icon name is one the app can draw. */
const isGlyphName = (name: string): name is GlyphName =>
  Object.hasOwn(iconRegistry, name);

/** Smoothstep between the keyframes either side of `phase`. */
function poseAt(frames: QuizArtFrame[] = [], phase: number): CSSProperties {
  if (frames.length === 0) return { transform: "none", opacity: 1 };
  const t = Math.max(0, Math.min(1, phase));
  let index = frames.findIndex((frame) => frame.at >= t);
  if (index < 0) index = frames.length - 1;
  const a = frames[Math.max(0, index - 1)];
  const b = frames[index];
  const u = b.at === a.at ? 0 : (t - a.at) / (b.at - a.at);
  const eased = u * u * (3 - 2 * u);
  const mix = (from: number, to: number) => from + (to - from) * eased;
  return {
    transform: `translate(${mix(a.x, b.x) / 2.2}%, ${mix(a.y, b.y) / 1.6}%) rotate(${mix(a.rotate, b.rotate)}deg) scale(${mix(a.scale, b.scale)})`,
    opacity: mix(a.opacity, b.opacity),
  };
}

/**
 * The layered artwork. It loops only while on screen, in a visible tab and
 * with motion allowed; otherwise it holds the still pose.
 */
function QuizScene({
  layers,
  pivot,
  animate,
}: {
  layers: QuizArtLayer[];
  pivot: [number, number];
  animate: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const nodes = element.querySelectorAll<HTMLDivElement>("[data-layer]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let request = 0;
    let started = 0;

    const paint = (phase: number) =>
      layers.forEach((layer, index) => {
        const pose = poseAt(layer.frames, phase);
        nodes[index].style.transform = String(pose.transform);
        nodes[index].style.opacity = String(pose.opacity);
      });
    const tick = (time: number) => {
      if (!started) started = time;
      paint(((time - started) % CYCLE_MS) / CYCLE_MS);
      request = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(request);
      request = 0;
      started = 0;
      if (animate && visible && !document.hidden && !reduced.matches) {
        request = requestAnimationFrame(tick);
      } else {
        paint(STILL_PHASE);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [layers, animate]);

  return (
    <div ref={root} className={styles.scene} aria-hidden>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={styles.layer}
          data-layer={layer.id}
          style={{
            transformOrigin: `${pivot[0]}% ${pivot[1]}%`,
            ...poseAt(layer.frames, STILL_PHASE),
          }}
        >
          <Image
            src={layer.src}
            alt=""
            fill
            sizes="220px"
            className={styles.layerImage}
          />
        </div>
      ))}
    </div>
  );
}

export type TrendingSportsQuizWidgetProps = {
  /** Picks the icon, the accent and the default label. */
  sport: string;
  /** A Material icon name from the API, such as "sports_soccer". Overrides the sport's own icon. */
  icon?: string;
  /** Defaults to "<SPORT> QUIZ". */
  title?: string;
  actionLabel?: string;
  /** Artwork layers, bottom to top. Without them, the sport's icon fills the art window. */
  layers?: QuizArtLayer[];
  /** The art's transform origin, in percent. */
  pivot?: [number, number];
  animate?: boolean;
  /** The card is a link when given, otherwise a button. */
  href?: string;
  onClick?: () => void;
};

/** A sport's quiz as one card: the sport, the quiz art, its title and a play action. */
export function TrendingSportsQuizWidget({
  sport,
  icon,
  title,
  actionLabel = "Play quiz",
  layers = [],
  pivot = FOOTBALL_QUIZ_PIVOT,
  animate = true,
  href,
  onClick,
}: TrendingSportsQuizWidgetProps) {
  const look = SPORTS[sport.toLowerCase()];
  const Icon = icon && isGlyphName(icon) ? iconRegistry[icon] : look?.icon;
  const style = {
    "--sport-accent": look?.accent ?? "var(--ds-color-accent-cyan)",
  } as CSSProperties;

  const content = (
    <>
      <span className={styles.chrome} aria-hidden>
        <span className={styles.rail} />
      </span>
      <div className={styles.status}>
        <span className={styles.marker}>
          {Icon && <Icon size={16} aria-hidden />}
          <span>{sport}</span>
        </span>
      </div>
      <div className={styles.quizArt}>
        {layers.length > 0 ? (
          <QuizScene layers={layers} pivot={pivot} animate={animate} />
        ) : (
          Icon && (
            <span className={styles.artIcon} aria-hidden>
              <Icon size={ART_ICON_SIZE} aria-hidden />
            </span>
          )
        )}
      </div>
      {/* Not an <h3>: a heading element is not allowed inside a <button>. */}
      <span className={styles.title} role="heading" aria-level={3}>
        {title ?? `${sport.toUpperCase()} QUIZ`}
      </span>
      <div className={styles.action}>
        {actionLabel}
        <span className={styles.arrow} aria-hidden>
          ↗
        </span>
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={styles.plate} style={style} onClick={onClick}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      className={styles.plate}
      style={style}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
