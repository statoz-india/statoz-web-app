import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
  title?: string;
};

/**
 * Shared shell for every glyph: a square, currentColor-filled canvas that is
 * hidden from assistive technology unless it is given a title.
 *
 * Filled rather than stroked, matching Material Symbols. Stroke-drawn brand
 * glyphs override `fill` and `stroke` themselves.
 */
export function Icon({
  size = 20,
  title,
  children,
  viewBox = "0 -960 960 960",
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
