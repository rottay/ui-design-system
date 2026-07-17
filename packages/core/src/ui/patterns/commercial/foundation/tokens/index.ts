/**
 * Commercial ramp — TypeScript mirror of the CSS token contract.
 *
 * Spec: commercial-surfaces/README.md section 2. TS/styled consumers reference these tokens
 * (the `var(--ds-commercial-*)` strings), never raw hex literals, so the monochrome law is
 * enforced by one source of truth. The hex values live in `commercial-ramp.css`; this file
 * exposes the variable REFERENCES plus the raw ramp for build-time tooling (e.g. OG image
 * generation) that cannot read CSS custom properties.
 */

/** The 11 perceptually-even grayscale steps (gray-0 = black .. gray-1000 = white). */
export const COMMERCIAL_GRAY_HEX = {
  0: "#000000",
  100: "#1b1b1b",
  200: "#303030",
  300: "#474747",
  400: "#5e5e5e",
  500: "#777777",
  600: "#919191",
  700: "#ababab",
  800: "#c6c6c6",
  900: "#e2e2e2",
  1000: "#ffffff",
} as const;

/** The flagship dark surface (spec section 2). */
export const COMMERCIAL_INK_HEX = "#0a0a0c";
export const COMMERCIAL_PAPER_HEX = "#ffffff";

export type CommercialGrayStep = keyof typeof COMMERCIAL_GRAY_HEX;

/** CSS variable reference for a grayscale step: `var(--ds-commercial-gray-500)`. */
export function commercialGray(step: CommercialGrayStep): string {
  return `var(--ds-commercial-gray-${step})`;
}

/** Named token references for TS/styled consumers. */
export const commercialTokens = {
  ink: "var(--ds-commercial-ink)",
  paper: "var(--ds-commercial-paper)",
  hairline: "var(--ds-commercial-hairline)",
  hairlineStrong: "var(--ds-commercial-hairline-strong)",
  fg: "var(--ds-commercial-fg)",
  bg: "var(--ds-commercial-bg)",
  fontMono: "var(--ds-commercial-font-mono)",
  motionFast: "var(--ds-commercial-motion-fast)",
  motionNormal: "var(--ds-commercial-motion-normal)",
  motionSlow: "var(--ds-commercial-motion-slow)",
  motionEase: "var(--ds-commercial-motion-ease)",
} as const;
