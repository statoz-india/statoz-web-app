"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { BrandIcon } from "@/utils";
import ComingSoonScreen from "@/widgets/ui/screen/comingSoon";

export type ComingSoonDialogProps = {
  /** The game that was asked for. */
  title: string;
  onClose: () => void;
};

/**
 * The answer a game gives while it cannot be played yet: the coming-soon
 * screen, shown as a popup over the page. It closes from the cross on the
 * card, from Escape, and from a press anywhere off the card.
 */
export function ComingSoonDialog({ title, onClose }: ComingSoonDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // The screen fills the popup, so everything around its card is the
        // way out.
        if (!(event.target as Element).closest("[data-coming-soon-card]")) {
          onClose();
        }
      }}
      className="m-0 flex h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <ComingSoonScreen
        feature={title}
        description="This game is not ready to play yet. Check back soon."
        // Not preloaded here: the popup mounts long after the page has loaded.
        icon={<BrandIcon name="logo" size={56} alt="" />}
        action={null}
        onClose={onClose}
      />
    </dialog>
  );
}

/**
 * The popup for one game tile: `open` to show it, and `dialog` to render
 * beside the tile. Nothing is mounted until the tile is pressed.
 */
export function useComingSoon(title: string): {
  open: () => void;
  dialog: ReactNode;
} {
  const [shown, setShown] = useState(false);
  return {
    open: () => setShown(true),
    dialog: shown ? (
      <ComingSoonDialog title={title} onClose={() => setShown(false)} />
    ) : null,
  };
}
