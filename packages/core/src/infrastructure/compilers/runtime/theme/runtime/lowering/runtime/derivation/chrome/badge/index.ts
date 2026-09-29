/**
 * @fileoverview The badge family: its tones on the palette's seeds, its counts
 * and dots on the type and radius roles, its rings and frames on the focus and
 * edge roles, and its geometry on the spacing ramp. Each relation is the one
 * the skin already stated as its own resting value; the deriver is where that
 * value now has a producer, so a decision can move it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/badge
 * @category Compilers
 * @package @rottay/design-system
 */

import { contrastRatio } from "@/foundation/kernel/color/contrast";
import {
  isHexColor,
  mixColor,
  normalizeHexColor,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import {
  WCAG_AA_NORMAL_TEXT_RATIO,
  measureReadableInk,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type {
  AssembledChannels,
  FamilyDeriver,
  LoweringContext,
} from "../../../../foundation/contract";
import { resolveContrastPosture } from "../../../../foundation/contrast-posture";

/** A vertical's own badge chrome outranks every relation stated here. */
export const badgeChromeDeriver: FamilyDeriver = {
  family: "badge",
  rank: "derived",
  scopes: ["density"],
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "surfaces.focusStyle",
    "surfaces.elevation",
    "typography.roles",
    "typography.roleWeights",
    "density",
  ],
  produces: [
    "--ds-badge-avatar-bg",
    "--ds-badge-avatar-border",
    "--ds-badge-avatar-border-width",
    "--ds-badge-avatar-radius",
    "--ds-badge-avatar-shadow",
    "--ds-badge-avatar-size",
    "--ds-badge-bordered-ring",
    "--ds-badge-chip-min-height",
    "--ds-badge-compact-font-weight",
    "--ds-badge-container-padding-inline",
    "--ds-badge-count-bg",
    "--ds-badge-count-border",
    "--ds-badge-count-border-width",
    "--ds-badge-count-color",
    "--ds-badge-count-font-family",
    "--ds-badge-count-font-size",
    "--ds-badge-count-font-weight",
    "--ds-badge-count-ring",
    "--ds-badge-count-selected-bg",
    "--ds-badge-count-selected-border",
    "--ds-badge-count-selected-ring",
    "--ds-badge-disabled-filter",
    "--ds-badge-dot-bg",
    "--ds-badge-dot-border",
    "--ds-badge-dot-border-width",
    "--ds-badge-dot-shadow",
    "--ds-badge-dot-size",
    "--ds-badge-focus-ring",
    "--ds-badge-frame-hover",
    "--ds-badge-frame-pressed",
    "--ds-badge-ghost-bg",
    "--ds-badge-ghost-border",
    "--ds-badge-ghost-color",
    "--ds-badge-ghost-shadow",
    "--ds-badge-highlight",
    "--ds-badge-highlight-hover",
    "--ds-badge-icon-bg",
    "--ds-badge-icon-border",
    "--ds-badge-icon-border-width",
    "--ds-badge-icon-color",
    "--ds-badge-icon-radius",
    "--ds-badge-icon-shadow",
    "--ds-badge-indicator-dot-size",
    "--ds-badge-indicator-max-inline-size",
    "--ds-badge-indicator-radius",
    "--ds-badge-ink",
    "--ds-badge-ink-hover",
    "--ds-badge-ink-pressed",
    "--ds-badge-outline-bg",
    "--ds-badge-outline-border",
    "--ds-badge-outline-color",
    "--ds-badge-outline-shadow",
    "--ds-badge-pill-min-height",
    "--ds-badge-pill-radius",
    "--ds-badge-position-transform",
    "--ds-badge-press-transform",
    "--ds-badge-radius-sm",
    "--ds-badge-remove-bg",
    "--ds-badge-remove-border",
    "--ds-badge-remove-border-width",
    "--ds-badge-remove-color",
    "--ds-badge-remove-focus-ring",
    "--ds-badge-remove-hover-bg",
    "--ds-badge-remove-hover-transform",
    "--ds-badge-remove-opacity",
    "--ds-badge-remove-radius",
    "--ds-badge-remove-touch-size",
    "--ds-badge-selected-frame",
    "--ds-badge-selected-ink",
    "--ds-badge-selected-shadow",
    "--ds-badge-selected-surface",
    "--ds-badge-shadow",
    "--ds-badge-shadow-hover",
    "--ds-badge-shadow-pressed",
    "--ds-badge-soft-bg",
    "--ds-badge-soft-border",
    "--ds-badge-soft-color",
    "--ds-badge-solid-bg",
    "--ds-badge-solid-border",
    "--ds-badge-solid-color",
    "--ds-badge-spinner-duration",
    "--ds-badge-surface",
    "--ds-badge-surface-pressed",
  ],
  derive: (context, below) => ({
    ...deriveBadgeChannels(),
    "--ds-badge-selected-ink": deriveSelectedInk(context, below),
  }),
};

const SELECTED_INK_CHAIN = "var(--ds-filter-pill-active-color, var(--ds-color-primary))";
/** The selected surface as the cascade resolves it when nobody authored the pill or the control ground. */
const ACTIVE_CONTROL_SURFACE =
  "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-active-shift, 7%), var(--ds-surface-control))";
const INK_STEPS = 20;

/**
 * The selected chip reads the primary over its own active wash. Where that pair
 * clears AA the chain stays; where it does not, the ink moves toward the
 * posture's readable ink by the smallest step that clears it.
 * An authored pill, badge selection or control ground, or any non-hex input,
 * keeps the chain: the surface the ink would be measured against is not known.
 */
export function deriveSelectedInk(context: LoweringContext, below: AssembledChannels): string {
  const chrome = context.theme.chrome;
  const pill = chrome?.filterPill;
  const badge = chrome?.badge;
  if (pill?.activeColor || pill?.activeBg || badge?.selectedInk || badge?.selectedSurface) {
    return SELECTED_INK_CHAIN;
  }
  const activeSurface = below["--ds-material-control-background-active"];
  if (activeSurface !== undefined && activeSurface !== ACTIVE_CONTROL_SURFACE) return SELECTED_INK_CHAIN;
  const control = below["--ds-surface-control"];
  if (control !== undefined && !control.startsWith("var(--ds-color-bg-input")) return SELECTED_INK_CHAIN;

  const primary = below["--ds-color-primary"] ?? context.theme.palette?.primaryColor;
  const ground = below["--ds-color-bg-input"];
  const shift = /^(\d+(?:\.\d+)?)%$/.exec((below["--ds-state-active-shift"] ?? "7%").trim());
  if (!primary || !ground || !isHexColor(primary) || !isHexColor(ground) || !shift) {
    return SELECTED_INK_CHAIN;
  }

  const ink = normalizeHexColor(primary);
  const surface = mixColor(normalizeHexColor(ground), ink, Number(shift[1]) / 100);
  const floor = WCAG_AA_NORMAL_TEXT_RATIO;
  if (contrastRatio(ink, surface) >= floor) return SELECTED_INK_CHAIN;

  const posture = resolveContrastPosture(context.theme);

  const readable = measureReadableInk(surface, {
    light: posture.inkLight,
    dark: posture.inkDark,
    minimumRatio: floor,
  });
  if (readable.status !== "measured") return SELECTED_INK_CHAIN;
  for (let step = 1; step < INK_STEPS; step += 1) {
    const candidate = mixColor(ink, readable.ink, step / INK_STEPS);
    if (contrastRatio(candidate, surface) >= floor) return candidate;
  }
  return readable.ink;
}

/**
 * NOT produced here, by design: the channels the divergence law keeps
 * UNAUTHORED by the vertical, so a customer can still pin what the cascade
 * otherwise resolves; and the names another owner already writes -- the
 * palette's alpha ramp, and the pill channels the kernel itself lowers from
 * `chrome.filterPill`. Their resting values live in authored CSS, which gives
 * the gate a producer without a second writer in the artifact.
 */
export function deriveBadgeChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-badge-avatar-bg"] = "var(--ds-surface-raised)";
  vars["--ds-badge-avatar-border"] = "color-mix(in srgb, currentColor 18%, transparent)";
  vars["--ds-badge-avatar-border-width"] = "var(--ds-edge-hairline-width, 1px)";
  vars["--ds-badge-avatar-radius"] = "var(--ds-radius-full)";
  vars["--ds-badge-avatar-shadow"] = "0 1px 2px color-mix(in srgb, currentColor 12%, transparent)";
  vars["--ds-badge-avatar-size"] = "calc(var(--ds-badge-resolved-height) - 0.25rem)";
  vars["--ds-badge-bordered-ring"] = "0 0 0 2px var(--ds-surface-card)";
  vars["--ds-badge-chip-min-height"] = "var(--ds-badge-resolved-height)";
  vars["--ds-badge-compact-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-badge-container-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-badge-count-bg"] = "var(--ds-filter-pill-count-bg, var(--ds-surface-raised, var(--ds-color-bg-elevated)))";
  vars["--ds-badge-count-border"] = "var(--ds-filter-pill-count-border, color-mix(in srgb, currentColor 16%, transparent))";
  vars["--ds-badge-count-border-width"] = "var(--ds-edge-hairline-width, 1px)";
  vars["--ds-badge-count-color"] = "var(--ds-badge-tone-soft-color, currentColor)";
  vars["--ds-badge-count-font-family"] = "var(--ds-font-family-mono)";
  vars["--ds-badge-count-font-size"] = "0.82em";
  vars["--ds-badge-count-font-weight"] = "var(--ds-font-weight-bold)";
  vars["--ds-badge-count-ring"] = "var(--ds-filter-pill-count-ring, none)";
  vars["--ds-badge-count-selected-bg"] = "var(--ds-filter-pill-count-active-bg, var(--ds-surface-raised))";
  vars["--ds-badge-count-selected-border"] = "var(--ds-filter-pill-count-active-border, currentColor)";
  vars["--ds-badge-count-selected-ring"] = "var(--ds-filter-pill-count-active-ring, none)";
  vars["--ds-badge-disabled-filter"] = "saturate(0.62)";
  vars["--ds-badge-dot-bg"] = "currentColor";
  vars["--ds-badge-dot-border"] = "color-mix(in srgb, currentColor 18%, transparent)";
  vars["--ds-badge-dot-border-width"] = "var(--ds-edge-hairline-width, 1px)";
  vars["--ds-badge-dot-shadow"] = "0 0 0 2px color-mix(in srgb, currentColor 8%, transparent)";
  vars["--ds-badge-dot-size"] = "0.45rem";
  vars["--ds-badge-focus-ring"] = "var(--ds-filter-pill-focus-ring, var(--ds-focus-ring))";
  vars["--ds-badge-frame-hover"] = "color-mix(in srgb, currentColor 24%, transparent)";
  vars["--ds-badge-frame-pressed"] = "var(--ds-badge-frame-hover, color-mix(in srgb, currentColor 24%, transparent))";
  vars["--ds-badge-ghost-bg"] = "transparent";
  vars["--ds-badge-ghost-border"] = "transparent";
  vars["--ds-badge-ghost-color"] = "var(--ds-badge-tone-soft-color)";
  vars["--ds-badge-ghost-shadow"] = "none";
  vars["--ds-badge-highlight"] = "inset 0 1px 0 color-mix(in srgb, var(--_ds-badge-specular, var(--ds-color-bg-elevated)) 46%, transparent)";
  vars["--ds-badge-highlight-hover"] = "inset 0 1px 0 color-mix(in srgb, var(--_ds-badge-specular, var(--ds-color-bg-elevated)) 58%, transparent)";
  vars["--ds-badge-icon-bg"] = "color-mix(in srgb, currentColor 8%, transparent)";
  vars["--ds-badge-icon-border"] = "color-mix(in srgb, currentColor 16%, transparent)";
  vars["--ds-badge-icon-border-width"] = "var(--ds-edge-hairline-width, 1px)";
  vars["--ds-badge-icon-color"] = "currentColor";
  vars["--ds-badge-icon-radius"] = "var(--ds-radius-full)";
  vars["--ds-badge-icon-shadow"] = "inset 0 1px 0 color-mix(in srgb, var(--_ds-badge-specular, var(--ds-color-bg-elevated)) 32%, transparent)";
  vars["--ds-badge-indicator-dot-size"] = "var(--ds-badge-dot-md-size)";
  vars["--ds-badge-indicator-max-inline-size"] = "6rem";
  vars["--ds-badge-indicator-radius"] = "var(--ds-radius-full)";
  vars["--ds-badge-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-badge-ink-hover"] = "var(--ds-badge-hover-ink-fallback)";
  vars["--ds-badge-ink-pressed"] = "var(--ds-badge-ink-hover, var(--ds-badge-hover-ink-fallback))";
  vars["--ds-badge-outline-bg"] = "transparent";
  vars["--ds-badge-outline-border"] = "var(--ds-badge-tone-outline)";
  vars["--ds-badge-outline-color"] = "var(--ds-badge-tone-soft-color)";
  vars["--ds-badge-outline-shadow"] = "inset 0 0 0 1px color-mix(in srgb, currentColor 5%, transparent)";
  vars["--ds-badge-pill-min-height"] = "var(--ds-badge-resolved-height)";
  vars["--ds-badge-pill-radius"] = "var(--ds-badge-radius, var(--ds-radius-full))";
  vars["--ds-badge-position-transform"] = "translateY(0)";
  vars["--ds-badge-press-transform"] = "translateY(0) scale(0.985)";
  vars["--ds-badge-radius-sm"] = "var(--ds-radius-sm)";
  vars["--ds-badge-remove-bg"] = "color-mix(in srgb, currentColor 6%, transparent)";
  vars["--ds-badge-remove-border"] = "color-mix(in srgb, currentColor 16%, transparent)";
  vars["--ds-badge-remove-border-width"] = "var(--ds-edge-hairline-width, 1px)";
  vars["--ds-badge-remove-color"] = "currentColor";
  vars["--ds-badge-remove-focus-ring"] = "0 0 0 2px color-mix(in srgb, currentColor 24%, transparent)";
  vars["--ds-badge-remove-hover-bg"] = "color-mix(in srgb, currentColor 12%, transparent)";
  vars["--ds-badge-remove-hover-transform"] = "scale(1.06)";
  vars["--ds-badge-remove-opacity"] = "0.72";
  vars["--ds-badge-remove-radius"] = "var(--ds-radius-full)";
  vars["--ds-badge-remove-touch-size"] = "var(--ds-touch-target-min, 44px)";
  vars["--ds-badge-selected-frame"] = "var(--ds-filter-pill-active-border, color-mix(in srgb, var(--ds-color-primary) 34%, transparent))";
  vars["--ds-badge-selected-ink"] = "var(--ds-filter-pill-active-color, var(--ds-color-primary))";
  vars["--ds-badge-selected-shadow"] = "var(--ds-filter-pill-active-shadow, inset 0 0 0 1px color-mix(in srgb, currentColor 12%, transparent))";
  vars["--ds-badge-selected-surface"] = "var(--ds-filter-pill-active-bg, var(--ds-color-alpha-primary-10))";
  vars["--ds-badge-shadow"] = "0 1px 2px color-mix(in srgb, currentColor 7%, transparent)";
  vars["--ds-badge-shadow-hover"] = "0 6px 14px -10px color-mix(in srgb, currentColor 42%, transparent)";
  vars["--ds-badge-shadow-pressed"] = "inset 0 1px 2px color-mix(in srgb, currentColor 12%, transparent)";
  vars["--ds-badge-soft-bg"] = "var(--ds-badge-tone-soft-bg)";
  vars["--ds-badge-soft-border"] = "color-mix(in srgb, currentColor 14%, transparent)";
  vars["--ds-badge-soft-color"] = "var(--ds-badge-tone-soft-color)";
  vars["--ds-badge-solid-bg"] = "var(--ds-badge-tone-solid-bg)";
  vars["--ds-badge-solid-border"] = "transparent";
  vars["--ds-badge-solid-color"] = "var(--ds-badge-tone-solid-color)";
  vars["--ds-badge-spinner-duration"] = "calc(var(--ds-motion-attention) * 2)";
  vars["--ds-badge-surface"] = "var(--ds-color-neutral-200)";
  vars["--ds-badge-surface-pressed"] = "var(--ds-badge-surface-hover, var(--_ds-badge-hover-bg-fallback))";
  return vars;
}
