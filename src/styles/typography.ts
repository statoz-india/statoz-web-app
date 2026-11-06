/**
 * Typography tokens. The size scale carries the steps the StatOz surfaces
 * actually use — the Flutter app leans on 10, 13, 15, 17 and 22px far more than
 * on a conventional web scale, so the ramp is calibrated to those.
 */
export const typography = {
  family: {
    body: 'var(--font-onest), "Onest", system-ui, sans-serif',
    display:
      'var(--font-orbitron), "Orbitron", var(--font-onest), "Onest", system-ui, sans-serif',
    mono: 'ui-monospace, "SFMono-Regular", monospace',
    grotesk:
      'var(--font-space-grotesk), "Space Grotesk", var(--font-onest), "Onest", system-ui, sans-serif',
  },
  size: {
    nano: "0.5rem",
    chip: "0.53125rem",
    micro: "0.5625rem",
    "2xs": "0.625rem",
    xs: "0.6875rem",
    compact: "0.75rem",
    option: "0.78125rem",
    sm: "0.8125rem",
    review: "0.84375rem",
    md: "0.875rem",
    base: "0.9375rem",
    question: "1rem",
    lg: "1.0625rem",
    badge: "1.125rem",
    xl: "1.25rem",
    /** PICK LOCKED, over a just-bought pick. */
    locked: "1.3125rem",
    "2xl": "1.375rem",
    /** A profile setup step's title. */
    title: "1.5rem",
    /** The ACQUIRED overlay's item name. */
    headline: "1.625rem",
    "3xl": "2rem",
    /** A pick market's leading price. */
    price: "2.125rem",
    hero: "2.625rem",
    celebration: "3.375rem",
    countdown: "4.5rem",
    /** The question number that flashes over the quiz. */
    flash: "8rem",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    compact: 1,
    close: 1.1,
    tight: 1.2,
    snug: 1.25,
    body: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    normal: "0",
    hair: "0.01em",
    tight: "0.02em",
    firm: "0.03em",
    fine: "0.04em",
    label: "0.05em",
    snug: "0.06em",
    wide: "0.07em",
    display: "0.075em",
    loose: "0.08em",
    airy: "0.09em",
    broad: "0.1em",
    brisk: "0.11em",
    ultra: "0.12em",
    crisp: "0.13em",
    spread: "0.14em",
    stretch: "0.15em",
    reach: "0.16em",
    sweep: "0.17em",
    span: "0.18em",
    mega: "0.2em",
    max: "0.3em",
    /** In px, as the ACQUIRED overlay specifies them. */
    title: "1.4px",
    burst: "4.2px",
  },
  /** Every figure on the prediction surfaces uses tabular lining numerals. */
  numeric: {
    tabular: '"tnum" 1',
  },
} as const;

export type TypographyTokens = typeof typography;
