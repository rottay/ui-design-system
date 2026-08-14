/**
 * Monochrome ramp — TypeScript mirror of the CSS token contract.
 *
 * Spec: docs-engineering/engineering/design-system/commercial-surfaces/README.md section 2. TS/styled consumers reference these tokens
 * (the `var(--ds-color-mono-*)` strings), never raw hex literals, so the monochrome law is
 * enforced by one source of truth. The hex values live in
 * `foundation/tokens/css/foundation/monochrome/index.css`; this file exposes the variable
 * REFERENCES plus the raw ramp for build-time tooling (e.g. OG image generation) that cannot
 * read CSS custom properties.
 */

/** The 11 perceptually-even grayscale steps (mono-0 = black .. mono-1000 = white). */
export const MONO_GRAY_HEX = {
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
export const SURFACE_INK_HEX = "#0a0a0c";
export const SURFACE_PAPER_HEX = "#ffffff";

export type MonoGrayStep = keyof typeof MONO_GRAY_HEX;

/** CSS variable reference for a grayscale step: `var(--ds-color-mono-500)`. */
export function monoGray(step: MonoGrayStep): string {
  return `var(--ds-color-mono-${step})`;
}

/**
 * Named token references for TS/styled consumers.
 *
 * Motion, mono type and focus width resolve to the canonical DS channels rather than to a
 * second name for the same value: the ramp does not re-declare those roles.
 */
export const monoTokens = {
  ink: "var(--ds-color-surface-ink)",
  paper: "var(--ds-color-surface-paper)",
  hairline: "var(--ds-color-hairline)",
  hairlineStrong: "var(--ds-color-hairline-strong)",
  fg: "var(--ds-surface-fg)",
  bg: "var(--ds-surface-bg)",
  fontMono: "var(--ds-font-mono)",
  motionFast: "var(--ds-duration-fast)",
  motionNormal: "var(--ds-duration-normal)",
  motionSlow: "var(--ds-duration-slow)",
  motionEase: "var(--ds-ease-out)",
} as const;
