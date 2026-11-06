import type { Sport } from "@/config/sports";
import {
  BasketballIcon,
  CricketIcon,
  FootballIcon,
  MotorsportIcon,
  type IconProps,
} from "@/lib/icons";

const glyphs = {
  football: FootballIcon,
  cricket: CricketIcon,
  basketball: BasketballIcon,
  racing: MotorsportIcon,
} as const;

/** Resolves a sport to its glyph so callers do not switch on the union. */
export function SportIcon({ sport, ...props }: IconProps & { sport: Sport }) {
  const Glyph = glyphs[sport];
  return <Glyph {...props} />;
}
