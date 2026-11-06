"use client";

import { useEffect, useRef, type ComponentType, type ReactNode } from "react";

import { useScrollLock } from "@/hooks/useScrollLock";
import { CloseIcon, type IconProps } from "@/lib/icons";
import { accentVar, withAlpha } from "@/styles";

import styles from "../css/profile.module.css";
import { Cut } from "./surfaces";

export type OverlaySize = "sheet" | "dialog" | "full";

const sizes: Record<OverlaySize, string> = {
  sheet: "max-h-[86dvh] sm:max-h-[80dvh] sm:w-125",
  dialog: "max-h-[86dvh] sm:w-95",
  full: "h-[92dvh] max-h-none sm:h-[88dvh] sm:w-160",
};

/**
 * The one shell every profile sheet and dialog uses: a modal `<dialog>`, so
 * Escape, the focus trap and stacking come from the browser. It opens when it
 * mounts; `onClose` runs on Escape, the cross, or a press on the scrim.
 */
export function Overlay({
  title,
  icon: Icon,
  accent = accentVar("cyan"),
  size = "sheet",
  footer,
  onClose,
  children,
}: {
  title: string;
  icon?: ComponentType<IconProps>;
  accent?: string;
  size?: OverlaySize;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useScrollLock();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The dialog box is the panel itself, so only the scrim is the dialog.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`${styles.overlay} ${sizes[size]} m-0 mt-auto w-full max-w-none overflow-visible bg-transparent p-0 text-foreground drop-shadow-[0_6px_0_var(--ds-color-fixture-shadow)] sm:m-auto`}
    >
      <Cut
        edge={withAlpha(accent, 0.55)}
        fill="var(--ds-color-background-primary)"
        clip="var(--ds-clip-panel)"
        className={`flex flex-col ${size === "full" ? "h-[92dvh] sm:h-[88dvh]" : "max-h-[86dvh] sm:max-h-[80dvh]"}`}
      >
        <header className="flex items-center gap-2.5 border-b border-line-muted px-4.5 pt-4 pb-3.5">
          {Icon ? <Icon size={20} style={{ color: accent }} /> : null}
          <h2
            className="flex-1 font-display text-xs font-black tracking-ultra"
            style={{ color: accent }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="grid size-9 place-items-center text-muted transition-colors duration-150 hover:text-foreground"
          >
            <CloseIcon size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <footer className="border-t border-line-muted p-4">{footer}</footer>
        ) : null}
      </Cut>
    </dialog>
  );
}
