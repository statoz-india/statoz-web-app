"use client";

import {
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import styles from "./interactiveLineChart.module.css";

/** One plotted line. Several may share a chart when they share a scale. */
export type LineChartSeries = {
  id: string;
  label: string;
  /** Chronological values, oldest to newest. */
  values: number[];
  /** Identity colour. Falls back to the chart's accent. */
  color?: string;
  /** Washes the area under this line — reserve it for the leading series. */
  fill?: boolean;
};

export type LineChartMarker = {
  index: number;
  value: number;
  label: string;
  color?: string;
};

export type InteractiveLineChartProps = {
  /** Chronological values, oldest to newest. Empty input renders as zero. */
  values?: number[];
  /** Several lines instead of one. Takes precedence over `values`. */
  series?: LineChartSeries[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number) => void;
  /** Accessible name for the scrub control. */
  label: string;
  /** Describes the currently selected value to assistive technology. */
  valueText: (value: number, index: number) => string;
  /**
   * Holds each value until the next one — a price that only moves when a trade
   * lands, rather than drifting between them.
   */
  stepped?: boolean;
  /** Pins the vertical range instead of fitting it to the data. */
  scale?: { min: number; max: number };
  /** Places smaller values at the top, useful for race positions. */
  invertYAxis?: boolean;
  /** Optional annotated moments pinned to exact samples. */
  markers?: LineChartMarker[];
  axisFormatter?: (value: number) => string;
  accent?: string;
  height?: CSSProperties["height"];
  className?: string;
};

const viewBoxWidth = 1000;
const viewBoxHeight = 100;

function clampIndex(index: number | null, pointCount: number): number {
  if (pointCount <= 1) return 0;
  if (index === null) return pointCount - 1;
  return Math.min(Math.max(index, 0), pointCount - 1);
}

/**
 * A scrub-able line graph shared by XP, odds, and any future history surface.
 *
 * The lines use a stretched SVG, but the selected guide and ring are HTML/CSS
 * elements in screen space. A circle inside `preserveAspectRatio="none"` scales
 * into an ellipse; keeping the pointer outside the SVG makes it stay perfectly
 * circular at every responsive aspect ratio.
 */
export function InteractiveLineChart({
  values,
  series,
  selectedIndex,
  onSelectedIndexChange,
  label,
  valueText,
  stepped = false,
  scale,
  invertYAxis = false,
  markers = [],
  axisFormatter,
  accent = "var(--ds-color-accent-cyan)",
  height,
  className,
}: InteractiveLineChartProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const lines: LineChartSeries[] =
    series && series.length > 0
      ? series
      : [
          {
            id: "primary",
            label,
            values: values && values.length > 0 ? values : [0],
          },
        ];

  const pointCount = Math.max(...lines.map((line) => line.values.length), 1);
  const activeIndex = clampIndex(selectedIndex, pointCount);
  const primary = lines[0];
  const activeValue =
    primary.values[Math.min(activeIndex, primary.values.length - 1)] ?? 0;

  const everyValue = lines.flatMap((line) => line.values);
  const padding = Math.max(
    10,
    Math.floor(Math.abs(everyValue.at(-1) ?? 0) / 20),
  );
  const minValue = scale
    ? scale.min
    : Math.max(0, Math.min(...everyValue) - padding);
  const maxValue = scale ? scale.max : Math.max(...everyValue) + padding;
  const spread = Math.max(1, maxValue - minValue);

  const xAt = (index: number) =>
    pointCount === 1 ? viewBoxWidth : (viewBoxWidth * index) / (pointCount - 1);
  const yAt = (value: number) =>
    invertYAxis
      ? ((value - minValue) / spread) * viewBoxHeight
      : viewBoxHeight - ((value - minValue) / spread) * viewBoxHeight;

  /** A stepped line holds its value across to the next point, then jumps. */
  function pathFor(line: LineChartSeries): string {
    const points = line.values.map((value, index) => ({
      x: xAt(index),
      y: yAt(value),
    }));
    if (points.length === 0) return "";
    if (!stepped) return points.map(({ x, y }) => `${x},${y}`).join(" ");
    return points
      .flatMap((point, index) =>
        index === 0
          ? [`${point.x},${point.y}`]
          : [`${point.x},${points[index - 1].y}`, `${point.x},${point.y}`],
      )
      .join(" ");
  }

  const selectedX = (xAt(activeIndex) / viewBoxWidth) * 100;
  const selectedY = (yAt(activeValue) / viewBoxHeight) * 100;

  const selectAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = Math.min(
      Math.max((event.clientX - rect.left) / Math.max(1, rect.width), 0),
      1,
    );
    onSelectedIndexChange(Math.round(percent * (pointCount - 1)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    onSelectedIndexChange(
      Math.min(Math.max(activeIndex + direction, 0), pointCount - 1),
    );
  };

  return (
    <div
      className={[styles.plot, className ?? ""].filter(Boolean).join(" ")}
      style={
        {
          "--line-chart-accent": primary.color ?? accent,
          ...(height === undefined ? {} : { height }),
        } as CSSProperties
      }
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.max(0, pointCount - 1)}
      aria-valuenow={activeIndex}
      aria-valuetext={valueText(activeValue, activeIndex)}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        selectAt(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          selectAt(event);
        }
      }}
      onKeyDown={onKeyDown}
    >
      <div ref={canvasRef} className={styles.canvas} aria-hidden>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="none"
        >
          {[0, 50, 100].map((y) => (
            <line
              key={y}
              x1="0"
              x2={viewBoxWidth}
              y1={y}
              y2={y}
              className={styles.gridLine}
            />
          ))}
          {lines.map((line) =>
            line.fill ? (
              <polygon
                key={`${line.id}-fill`}
                points={`0,${viewBoxHeight} ${pathFor(line)} ${viewBoxWidth},${viewBoxHeight}`}
                className={styles.area}
                style={
                  { "--series-color": line.color ?? accent } as CSSProperties
                }
              />
            ) : null,
          )}
          {lines.map((line) => (
            <polyline
              key={line.id}
              points={pathFor(line)}
              className={styles.line}
              style={
                { "--series-color": line.color ?? accent } as CSSProperties
              }
            />
          ))}
        </svg>

        <span className={styles.guide} style={{ left: `${selectedX}%` }} />
        <span
          className={styles.marker}
          style={{ left: `${selectedX}%`, top: `${selectedY}%` }}
        />
        {markers.map((marker) => (
          <span
            key={`${marker.index}-${marker.label}`}
            className={styles.annotation}
            title={marker.label}
            style={
              {
                left: `${(xAt(marker.index) / viewBoxWidth) * 100}%`,
                top: `${(yAt(marker.value) / viewBoxHeight) * 100}%`,
                "--annotation-color": marker.color ?? accent,
              } as CSSProperties
            }
          />
        ))}
      </div>
      {axisFormatter ? (
        <span className={styles.axisHint} aria-hidden>
          {axisFormatter(activeValue)}
        </span>
      ) : null}
    </div>
  );
}
