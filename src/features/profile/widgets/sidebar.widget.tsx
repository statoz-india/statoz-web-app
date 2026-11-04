import Link from "next/link";
import type { ComponentType } from "react";

import {
  ChevronRightIcon,
  HeadsetIcon,
  MenuBookIcon,
  SettingsIcon,
  StyleIcon,
  type IconProps,
} from "@/lib/icons";

import { enter } from "../components/surfaces";

const ACTIONS: {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
  href?: string;
}[] = [
  { id: "cards", label: "All Cards", icon: StyleIcon },
  { id: "how-to-play", label: "How To Play", icon: MenuBookIcon, href: "/profile/how-to-play" },
  {
    id: "support",
    label: "Talk to StatOz 1:1",
    icon: HeadsetIcon,
    href: "/profile/talk-to-statoz",
  },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

/** All Cards, How To Play, Talk to StatOz 1:1 and Settings. */
export function ActionRows({ onSettings }: { onSettings: () => void }) {
  const motion = enter(360);
  return (
    <ul
      className={`${motion.className} flex flex-col gap-2.5`}
      style={motion.style}
    >
      {ACTIONS.map(({ id, label, icon: Icon, href }) => {
        const className =
          "flex w-full items-center gap-3 border border-line bg-surface/50 p-4 text-left transition-transform duration-150 hover:-translate-y-px active:translate-y-0 motion-reduce:transform-none";
        const content = (
          <>
            <Icon size={20} className="text-cyan" />
            <span className="flex-1 font-sans text-md leading-compact font-semibold">
              {label}
            </span>
            <ChevronRightIcon size={20} className="text-muted" />
          </>
        );
        return (
          <li key={id}>
            {href ? (
              <Link href={href} className={className}>
                {content}
              </Link>
            ) : (
              <button
                type="button"
                onClick={id === "settings" ? onSettings : undefined}
                className={className}
              >
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
