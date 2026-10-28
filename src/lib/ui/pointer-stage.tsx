"use client";

import {
  useRef,
  type ComponentPropsWithoutRef,
  type PointerEvent,
} from "react";

export type PointerStageProps = ComponentPropsWithoutRef<"section">;

/**
 * A section that publishes where the mouse is over it, as `--pointer-x` and
 * `--pointer-y`: -1 to 1, with 0 at the centre. What moves in response is left
 * to the styles, so nothing re-renders while the pointer travels.
 */
export function PointerStage({ children, ...props }: PointerStageProps) {
  const frame = useRef(0);

  function track(event: PointerEvent<HTMLElement>) {
    // A touch drag is a scroll, not a look around.
    if (event.pointerType === "touch") return;

    const stage = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const box = stage.getBoundingClientRect();
      const x = ((clientX - box.left) / box.width) * 2 - 1;
      const y = ((clientY - box.top) / box.height) * 2 - 1;
      stage.style.setProperty("--pointer-x", x.toFixed(3));
      stage.style.setProperty("--pointer-y", y.toFixed(3));
    });
  }

  function release(event: PointerEvent<HTMLElement>) {
    cancelAnimationFrame(frame.current);
    event.currentTarget.style.removeProperty("--pointer-x");
    event.currentTarget.style.removeProperty("--pointer-y");
  }

  return (
    <section {...props} onPointerMove={track} onPointerLeave={release}>
      {children}
    </section>
  );
}
