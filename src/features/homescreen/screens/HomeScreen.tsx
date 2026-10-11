import { Suspense } from "react";

import { HomeHub } from "../components/home-hub";

/**
 * The SPORTS destination: the MATCH and GAMES hub.
 *
 * The hub reads its tab and sport from the URL, which is only known per
 * request, so it sits in a Suspense boundary and the rest of the page can
 * still be prerendered.
 */
export default function HomeScreen() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <HomeHub />
    </Suspense>
  );
}
