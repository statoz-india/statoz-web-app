import Link from "next/link";
import type { ReactNode } from "react";

type NavRailItemBase = {
  id: string;
  label: string;
  icon: ReactNode;
  accent: string;
};

export type NavRailItem = NavRailItemBase &
  ({ href: string; onSelect?: never } | { href?: never; onSelect: () => void });

export type NavRailProps = {
  items: NavRailItem[];
  activeId?: string;
  orientation?: "bar" | "rail";
  label: string;
  className?: string;
};

/**
 * Primary destination switcher. The same items, accents, and active treatment
 * render either as a bottom bar on small screens or as a side rail on large
 * ones, so the product's navigation identity survives the reflow.
 */
export function NavRail({
  items,
  activeId,
  orientation = "bar",
  label,
  className,
}: NavRailProps) {
  const rail = orientation === "rail";

  return (
    <nav
      aria-label={label}
      className={[rail ? "h-full w-full py-4" : "px-2 py-3", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={{ background: "var(--ds-gradient-nav-bar)" }}
    >
      <ul
        className={[
          "flex",
          rail ? "flex-col gap-1.5" : "items-stretch gap-1.5",
        ].join(" ")}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          const itemClassName = [
            "flex min-h-15 w-full transition-colors duration-200",
            rail
              ? "flex-row items-center gap-3 px-4 py-3"
              : "flex-col items-center justify-center gap-1.5 px-1",
          ].join(" ");
          const itemStyle = {
            color: active ? item.accent : "var(--ds-color-text-disabled)",
            background: active
              ? `color-mix(in srgb, ${item.accent} 10%, transparent)`
              : undefined,
          };
          const content = (
            <>
              <span className="grid size-5 shrink-0 place-items-center">
                {item.icon}
              </span>
              <span
                className={[
                  "font-display leading-tight",
                  rail ? "text-xs" : "text-2xs",
                  active ? "font-black" : "font-semibold",
                ].join(" ")}
              >
                {item.label}
              </span>
            </>
          );
          return (
            <li key={item.id} className={rail ? "" : "flex-1"}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={itemClassName}
                  style={itemStyle}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.onSelect}
                  aria-current={active ? "page" : undefined}
                  className={itemClassName}
                  style={itemStyle}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
