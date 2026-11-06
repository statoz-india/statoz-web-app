"use client";

import { useEffect } from "react";

/** How many mounted overlays want the page still, and its overflow before the first. */
let locks = 0;
let before = "";

/**
 * Stops the page behind an overlay from scrolling while the caller is
 * mounted. Counted, so overlays that overlap can close in any order and the
 * page only scrolls again once the last one has gone.
 */
export function useScrollLock() {
  useEffect(() => {
    if (locks++ === 0) {
      before = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (--locks === 0) document.body.style.overflow = before;
    };
  }, []);
}
