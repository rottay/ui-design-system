/**
 * MASS C3-BITHIRE-ALL — the BitHire artifact extension drained to zero.
 *
 * The tranche this file grades: `artifacts/bithire/_source/extension.css` held
 * 94 custom-property declarations over 93 unique channels in 20 families, and
 * every one of them is now authored by a typed Theme owner and emitted by the
 * common `compileTheme` / `chromeToVariables` lowering.
 *
 * Three claims, each graded separately because they fail differently:
 *
 * 1. DRAIN — the extension declares nothing. A file that still declares one
 *    channel is a file that still competes with the compiler.
 * 2. PARITY — every drained channel is emitted, and with the value the
 *    extension used to give it. 81 of the 94 are the same string modulo the
 *    whitespace Prettier put in the stylesheet; the other 13 are recorded
 *    below one by one, each with the reason its string moved and an
 *    executable statement of what it must now equal. There is no "close
 *    enough" bucket.
 * 3. AUTHORITY — deleting the typed owner deletes the channel. This is what
 *    separates "the compiler emits it too" from "the compiler is the author":
 *    a channel that survives its owner's deletion is being painted by
 *    something else and the drain moved nothing.
 *
 * The pre-drain values are historical data recovered from the file's last
 * declaring revision, kept verbatim. They are NOT re-read from the live
 * source — the live source is empty, which is the point.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  compileBrandTheme,
  compileTheme,
} from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { DEFAULT_CHROME_SHAPE } from "@/foundation/contracts/composition/tenants/themes/iso/shape";

import { bithireBrandTheme } from "../ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "../ts/presentation/brand-themes/evnto";
import { FIRST_PARTY_THEMES } from "../ts/presentation/brand-themes";
import { rottayBrandTheme } from "../ts/presentation/brand-themes/rottay";

/**
 * Which block of the pre-drain stylesheet a declaration lived in.
 *
 * `light` is the historically interesting one: those 38 declarations sat under
 * `:not([data-theme="dark"])`. `light` is BitHire's declared
 * `appearance.defaultMode` and `compileModeBlocks` REJECTS an overlay for a
 * theme's own default mode, so they are authored in the theme body and the
 * dark block pins whatever dark used to resolve. See DARK_PINS.
 */
type Scope = "base" | "light" | "dark";

interface DrainedChannel {
  readonly family: string;
  readonly scope: Scope;
  readonly name: string;
  /** The declaration's value in the last revision that declared it. */
  readonly extension: string;
}

/** The exact pre/post classification table, one row per declaration. */
const DRAINED: readonly DrainedChannel[] = [
  { family: "badge-geometry", scope: "base", name: "--ds-badge-height", extension: "28px" },
  { family: "badge-geometry", scope: "base", name: "--ds-badge-line-height", extension: "1.2" },
  { family: "badge-geometry", scope: "base", name: "--ds-badge-padding-x", extension: "0.625rem" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-default-bg", extension: "var(--ds-control-surface-raised)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-default-color", extension: "var(--ds-control-ink-muted)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-error-bg", extension: "color-mix( in srgb, var(--ds-color-error) 12%, var(--ds-control-surface) )" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-error-color", extension: "var(--ds-color-error)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-info-bg", extension: "color-mix( in srgb, var(--ds-color-info, var(--ds-color-secondary, var(--ds-color-primary))) 12%, var(--ds-control-surface) )" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-info-color", extension: "var( --ds-color-info, var(--ds-color-secondary, var(--ds-color-primary)) )" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-primary-bg", extension: "var(--ds-control-brand-tint)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-primary-color", extension: "var(--ds-color-primary)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-secondary-bg", extension: "var(--ds-control-surface-raised)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-secondary-color", extension: "var(--ds-control-ink-muted)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-success-bg", extension: "color-mix( in srgb, var(--ds-color-success) 12%, var(--ds-control-surface) )" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-success-color", extension: "var(--ds-color-success)" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-warning-bg", extension: "color-mix( in srgb, var(--ds-color-warning) 16%, var(--ds-control-surface) )" },
  { family: "badge-variant", scope: "base", name: "--ds-badge-warning-color", extension: "var( --ds-color-warning-900, var(--ds-color-warning) )" },
  { family: "button-bg-active", scope: "base", name: "--ds-button-primary-bg-active", extension: "var( --ds-color-primary-active, var(--ds-button-primary-bg-hover) )" },
  { family: "button-bg-active", scope: "base", name: "--ds-button-secondary-bg-active", extension: "color-mix( in srgb, var(--ds-color-primary) 18%, var(--ds-control-surface) )" },
  { family: "button-danger-legacy", scope: "base", name: "--ds-button-danger-bg", extension: "var(--ds-color-error)" },
  { family: "button-danger-legacy", scope: "base", name: "--ds-button-danger-border", extension: "var(--ds-button-danger-bg)" },
  { family: "button-danger-legacy", scope: "base", name: "--ds-button-danger-color", extension: "var( --ds-color-text-on-error, var(--ds-control-on-brand) )" },
  { family: "button-danger-legacy", scope: "base", name: "--ds-button-danger-hover-bg", extension: "var( --ds-color-error-hover, var(--ds-color-error) )" },
  { family: "button-error", scope: "base", name: "--ds-button-error-bg", extension: "var(--ds-button-danger-bg)" },
  { family: "button-error", scope: "base", name: "--ds-button-error-bg-hover", extension: "var(--ds-button-danger-hover-bg)" },
  { family: "button-error", scope: "base", name: "--ds-button-error-border", extension: "var(--ds-button-danger-border)" },
  { family: "button-error", scope: "base", name: "--ds-button-error-color", extension: "var(--ds-button-danger-color)" },
  { family: "button-hover-bg-legacy", scope: "base", name: "--ds-button-default-hover-bg", extension: "var(--ds-button-default-bg-hover)" },
  { family: "button-hover-bg-legacy", scope: "base", name: "--ds-button-ghost-hover-bg", extension: "var(--ds-button-ghost-bg-hover)" },
  { family: "button-hover-bg-legacy", scope: "base", name: "--ds-button-primary-hover-bg", extension: "var(--ds-button-primary-bg-hover)" },
  { family: "button-hover-bg-legacy", scope: "base", name: "--ds-button-secondary-hover-bg", extension: "var(--ds-button-secondary-bg-hover)" },
  { family: "button-hover-bg-legacy", scope: "base", name: "--ds-button-text-hover-bg", extension: "var(--ds-button-text-bg-hover)" },
  { family: "button-link", scope: "base", name: "--ds-button-link-color", extension: "var(--ds-color-primary)" },
  { family: "button-link", scope: "base", name: "--ds-button-link-color-active", extension: "var( --ds-color-primary-active, var(--ds-button-link-color-hover) )" },
  { family: "button-link", scope: "base", name: "--ds-button-link-color-hover", extension: "var(--ds-color-primary-hover)" },
  { family: "button-status-ink", scope: "base", name: "--ds-button-info-color", extension: "var( --ds-color-text-on-info, var(--ds-control-on-brand) )" },
  { family: "button-status-ink", scope: "base", name: "--ds-button-success-color", extension: "var( --ds-color-text-on-success, var(--ds-control-on-brand) )" },
  { family: "button-status-ink", scope: "base", name: "--ds-button-warning-color", extension: "var(--ds-color-warning-900, var(--ds-control-ink))" },
  { family: "dark-info-ink", scope: "dark", name: "--ds-color-info-ink", extension: "var(--ds-color-info-300)" },
  { family: "detail", scope: "base", name: "--ds-detail-continuous-boundary", extension: "color-mix( in srgb, var(--ds-color-text-primary) 7.5%, transparent )" },
  { family: "detail", scope: "base", name: "--ds-detail-continuous-surface", extension: "color-mix( in srgb, var(--ds-surface-card-bg, var(--ds-surface-card)) 94%, transparent )" },
  { family: "detail", scope: "base", name: "--ds-detail-control-bg", extension: "color-mix( in srgb, var(--ds-control-surface) 92%, var(--ds-surface-card-bg, var(--ds-color-bg-primary)) )" },
  { family: "detail", scope: "base", name: "--ds-detail-control-border", extension: "color-mix( in srgb, var(--ds-color-text-primary) 10%, var(--ds-color-border-secondary) )" },
  { family: "detail", scope: "base", name: "--ds-detail-control-border-hover", extension: "color-mix( in srgb, var(--ds-color-primary) 22%, var(--ds-color-border-secondary) )" },
  { family: "detail", scope: "base", name: "--ds-detail-hero-spine", extension: "color-mix( in srgb, var(--ds-color-primary) 46%, transparent )" },
  { family: "focus-ring-color", scope: "light", name: "--ds-focus-ring-color", extension: "var(--ds-color-primary)" },
  { family: "input-border-color", scope: "light", name: "--ds-input-border-color", extension: "#c4d2de" },
  { family: "input-border-color", scope: "light", name: "--ds-input-border-color-focus", extension: "#3a6fb0" },
  { family: "input-border-color", scope: "light", name: "--ds-input-border-color-hover", extension: "#a8a7c6" },
  { family: "panel-shadow", scope: "light", name: "--ds-datepicker-panel-shadow", extension: "var(--ds-shadow-popover)" },
  { family: "panel-shadow", scope: "light", name: "--ds-shadow-popover", extension: "0 12px 30px rgba(20, 40, 59, 0.1), 0 2px 8px rgba(20, 40, 59, 0.06)" },
  { family: "panel-shadow", scope: "light", name: "--ds-timepicker-panel-shadow", extension: "var(--ds-shadow-popover)" },
  { family: "premium-card", scope: "light", name: "--ds-premium-card-bg", extension: "var(--ds-surface-card)" },
  { family: "premium-card", scope: "base", name: "--ds-premium-card-border", extension: "color-mix( in srgb, var(--ds-color-primary) 12%, var(--ds-color-border) )" },
  { family: "premium-card", scope: "base", name: "--ds-premium-card-border-hover", extension: "color-mix( in srgb, var(--ds-color-primary) 28%, var(--ds-color-border) )" },
  { family: "premium-card", scope: "light", name: "--ds-premium-card-footer-bg", extension: "color-mix( in srgb, var(--ds-surface-panel) 72%, var(--ds-surface-card) )" },
  { family: "premium-card", scope: "light", name: "--ds-premium-card-header-bg", extension: "color-mix( in srgb, var(--ds-surface-card) 82%, var(--ds-surface-panel) )" },
  { family: "premium-card", scope: "light", name: "--ds-premium-card-section-alt-bg", extension: "color-mix( in srgb, var(--ds-color-primary) 4%, var(--ds-surface-panel) )" },
  { family: "premium-card", scope: "light", name: "--ds-premium-card-section-bg", extension: "var(--ds-surface-card)" },
  { family: "premium-card", scope: "base", name: "--ds-premium-card-selected-border", extension: "color-mix( in srgb, var(--ds-color-primary) 46%, var(--ds-color-border) )" },
  { family: "premium-card", scope: "base", name: "--ds-premium-card-selected-ring", extension: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)" },
  { family: "premium-card", scope: "light", name: "--ds-premium-card-sheen", extension: "none" },
  { family: "select", scope: "light", name: "--ds-select-bg", extension: "#ffffff" },
  { family: "select", scope: "light", name: "--ds-select-bg-focus", extension: "#ffffff" },
  { family: "select", scope: "light", name: "--ds-select-bg-hover", extension: "#ffffff" },
  { family: "select", scope: "light", name: "--ds-select-border-color", extension: "#c4d2de" },
  { family: "select", scope: "light", name: "--ds-select-border-color-focus", extension: "#3a6fb0" },
  { family: "select", scope: "light", name: "--ds-select-border-color-hover", extension: "#a8a7c6" },
  { family: "select", scope: "light", name: "--ds-select-color", extension: "#14283b" },
  { family: "select", scope: "light", name: "--ds-select-color-placeholder", extension: "#8a9aaa" },
  { family: "select", scope: "dark", name: "--ds-select-dropdown-bg", extension: "var(--ds-surface-card)" },
  { family: "select", scope: "light", name: "--ds-select-dropdown-bg", extension: "#ffffff" },
  { family: "select", scope: "light", name: "--ds-select-dropdown-border-color", extension: "#d4e0ea" },
  { family: "select", scope: "light", name: "--ds-select-dropdown-shadow", extension: "var(--ds-shadow-popover)" },
  { family: "select", scope: "light", name: "--ds-select-option-bg-hover", extension: "#f4f8fd" },
  { family: "select", scope: "light", name: "--ds-select-option-bg-selected", extension: "#e8f3ff" },
  { family: "select", scope: "light", name: "--ds-select-option-color", extension: "#14283b" },
  { family: "select", scope: "light", name: "--ds-select-option-color-selected", extension: "#3a6fb0" },
  { family: "shell-geometry", scope: "light", name: "--ds-shell-sidebar-collapsed-width", extension: "64px" },
  { family: "shell-geometry", scope: "light", name: "--ds-shell-sidebar-width", extension: "256px" },
  { family: "shell-geometry", scope: "light", name: "--ds-shell-topbar-height", extension: "56px" },
  { family: "surface-card-grid", scope: "base", name: "--ds-surface-card-grid-bg", extension: "linear-gradient( var(--ds-surface-card-grid-line) 1px, transparent 1px ), linear-gradient( 90deg, var(--ds-surface-card-grid-line) 1px, transparent 1px ), linear-gradient( 115deg, transparent 0%, color-mix(in srgb, var(--ds-surface-card) 34%, transparent) 46%, transparent 66% )" },
  { family: "surface-card-grid", scope: "base", name: "--ds-surface-card-grid-line", extension: "color-mix( in srgb, var( --rt-premium-card-accent, var(--ds-signal-card-accent, var(--ds-color-primary)) ) 5%, transparent )" },
  { family: "surface-card-grid", scope: "base", name: "--ds-surface-card-grid-size", extension: "22px" },
  { family: "surface-semantic", scope: "light", name: "--ds-card-side-accent-soft", extension: "color-mix( in srgb, var(--ds-color-primary) 7%, transparent )" },
  { family: "surface-semantic", scope: "light", name: "--ds-surface-chip-bg", extension: "color-mix( in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card) )" },
  { family: "surface-semantic", scope: "light", name: "--ds-surface-icon-bg", extension: "color-mix( in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card) )" },
  { family: "surface-semantic", scope: "light", name: "--ds-surface-icon-border", extension: "color-mix( in srgb, var(--ds-color-primary) 24%, var(--ds-color-border) )" },
  { family: "surface-semantic", scope: "light", name: "--ds-surface-radius-md", extension: "var(--ds-radius-md)" },
  { family: "surface-semantic", scope: "light", name: "--ds-surface-shadow", extension: "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), 0 10px 24px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)" },
  { family: "surface-semantic", scope: "light", name: "--ds-surface-shadow-hover", extension: "0 2px 5px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), 0 14px 30px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)" },
  { family: "table-row-focus", scope: "base", name: "--ds-table-row-focus-shadow", extension: "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 28%, transparent), 0 4px 14px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)" },
  { family: "tooltip-z-index", scope: "base", name: "--ds-tooltip-z-index", extension: "2700" },
  { family: "tooltip-z-index", scope: "base", name: "--ds-z-index-tooltip", extension: "2700" },
] as const;

/** The family census the tranche was planned against; the sum is 94. */
const FAMILY_SIZES: Readonly<Record<string, number>> = {
  "badge-geometry": 3,
  "badge-variant": 14,
  "button-bg-active": 2,
  "button-danger-legacy": 4,
  "button-error": 4,
  "button-hover-bg-legacy": 5,
  "button-link": 3,
  "button-status-ink": 3,
  "dark-info-ink": 1,
  "detail": 6,
  "focus-ring-color": 1,
  "input-border-color": 3,
  "panel-shadow": 3,
  "premium-card": 10,
  "select": 16,
  "shell-geometry": 3,
  "surface-card-grid": 3,
  "surface-semantic": 7,
  "table-row-focus": 1,
  "tooltip-z-index": 2,
};

/**
 * The 13 channels whose emitted STRING differs from the drained declaration.
 *
 * Twelve are alias forwards: the extension wrote `var(--other-channel)` where
 * the compiler now writes the owner's own value into both spellings. The
 * assertion is therefore not "the string is what it was" — it is "this channel
 * equals the channel it used to point at", which is the property the alias
 * existed to provide and is checked against the live compile, not a copy.
 */
const ALIAS_FORWARDS: Readonly<Record<string, { target: string; why: string }>> =
  {
    // Reversed-order legacy spelling. One owner (`controls.button*.bgHover`),
    // two vocabularies — the same shape as `chrome.sidebar.width` emitting
    // `--ds-sidebar-width` and `--ds-shell-sidebar-width`.
    "--ds-button-primary-hover-bg": {
      target: "--ds-button-primary-bg-hover",
      why: "reversed-order legacy spelling of the same owner",
    },
    "--ds-button-secondary-hover-bg": {
      target: "--ds-button-secondary-bg-hover",
      why: "reversed-order legacy spelling of the same owner",
    },
    "--ds-button-default-hover-bg": {
      target: "--ds-button-default-bg-hover",
      why: "reversed-order legacy spelling of the same owner",
    },
    "--ds-button-ghost-hover-bg": {
      target: "--ds-button-ghost-bg-hover",
      why: "reversed-order legacy spelling of the same owner",
    },
    "--ds-button-text-hover-bg": {
      target: "--ds-button-text-bg-hover",
      why: "reversed-order legacy spelling of the same owner",
    },
    // The `danger` vocabulary and the `error` vocabulary are one owner,
    // `controls.buttonError`. The extension chained them by hand; the compiler
    // now writes the owner's value into both.
    "--ds-button-danger-border": {
      target: "--ds-button-danger-bg",
      why: "danger border tracked the danger bg",
    },
    "--ds-button-error-bg": {
      target: "--ds-button-danger-bg",
      why: "error vocabulary chained to the danger vocabulary",
    },
    "--ds-button-error-bg-hover": {
      target: "--ds-button-danger-hover-bg",
      why: "error vocabulary chained to the danger vocabulary",
    },
    "--ds-button-error-color": {
      target: "--ds-button-danger-color",
      why: "error vocabulary chained to the danger vocabulary",
    },
    "--ds-button-error-border": {
      target: "--ds-button-danger-border",
      why: "error vocabulary chained to the danger vocabulary",
    },
    // One owner, `chrome.surface.popoverShadow`, spelled into the popover
    // channel and both panel channels that used to alias it.
    "--ds-datepicker-panel-shadow": {
      target: "--ds-shadow-popover",
      why: "panel shadow aliased the popover shadow",
    },
    "--ds-timepicker-panel-shadow": {
      target: "--ds-shadow-popover",
      why: "panel shadow aliased the popover shadow",
    },
  };

/**
 * The thirteenth diff, and the only one that is not an alias.
 *
 * The drained declaration read through `--rt-premium-card-accent` before
 * falling back to `--ds-signal-card-accent`. `--rt-*` is a product dialect no
 * DS or app source declares, so the fallback was always the taken branch; the
 * typed owner drops the dead branch. C1's `--rt-*` guard asserts the dialect
 * is gone from all three extensions, and this states what replaced it.
 */
const BRANCH_REMOVALS: Readonly<Record<string, string>> = {
  "--ds-surface-card-grid-line":
    "color-mix(in srgb, var(--ds-signal-card-accent, var(--ds-color-primary)) 5%, transparent)",
};

/**
 * What dark resolves for the 34 formerly-`:not([data-theme="dark"])` channels.
 *
 * The extension scoped them to light only, so dark fell through to the DS
 * baseline. Authoring them in the theme body would have leaked the light value
 * into dark at tenant specificity, so each carries an explicit `modes.dark`
 * pin holding the baseline expression dark already resolved.
 */
const DARK_PINS: Readonly<Record<string, string>> = {
  "--ds-focus-ring-color": "var(--ds-color-primary-400)",
  "--ds-shadow-popover": "var(--ds-shadow-md)",
  "--ds-datepicker-panel-shadow": "var(--ds-shadow-md)",
  "--ds-timepicker-panel-shadow": "var(--ds-shadow-md)",
  "--ds-input-border-color": "var(--ds-color-neutral-300)",
  "--ds-input-border-color-hover": "var(--ds-color-neutral-400)",
  "--ds-input-border-color-focus": "var(--ds-color-primary-500)",
  "--ds-select-bg": "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
  "--ds-select-bg-hover": "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
  "--ds-select-bg-focus": "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
  "--ds-select-color": "var(--ds-color-neutral-900)",
  "--ds-select-color-placeholder": "var(--ds-color-neutral-400)",
  "--ds-select-border-color": "var(--ds-color-neutral-300)",
  "--ds-select-border-color-hover": "var(--ds-color-neutral-400)",
  "--ds-select-border-color-focus": "var(--ds-color-primary-500)",
  "--ds-select-dropdown-bg": "var(--ds-surface-card)",
  "--ds-select-dropdown-border-color": "var(--ds-color-neutral-200)",
  "--ds-select-dropdown-shadow": "var(--ds-shadow-lg)",
  "--ds-select-option-bg-hover": "var(--ds-color-neutral-100)",
  "--ds-select-option-bg-selected": "var(--ds-color-primary-50)",
  "--ds-select-option-color": "var(--ds-color-neutral-900)",
  "--ds-select-option-color-selected": "var(--ds-color-primary-700)",
  "--ds-surface-shadow": "var(--ds-shadow-sm)",
  "--ds-surface-shadow-hover": "var(--ds-shadow-md)",
  "--ds-surface-icon-bg": "linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card-bg)), color-mix(in srgb, var(--ds-color-secondary) 10%, var(--ds-surface-card-bg)))",
  "--ds-surface-icon-border": "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-surface-card-border))",
  "--ds-surface-chip-bg": "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card-bg))",
  "--ds-card-side-accent-soft": "transparent",
  "--ds-premium-card-bg": "var(--ds-material-card-background, var(--ds-card-bg))",
  "--ds-premium-card-sheen": "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-card-bg) 42%, transparent), transparent)",
  "--ds-premium-card-header-bg": "var(--ds-rich-card-header-bg)",
  "--ds-premium-card-section-bg": "var(--ds-rich-card-section-bg)",
  "--ds-premium-card-section-alt-bg": "var(--ds-rich-card-section-alt-bg)",
  "--ds-premium-card-footer-bg": "color-mix(in srgb, var(--ds-color-bg-secondary) 72%, var(--ds-card-bg))",
};

/**
 * The four formerly-light channels that need no dark pin.
 *
 * A radius and three shell dimensions do not move between modes, so the body
 * value is correct for both and `compileModeBlocks` would diff an identical
 * restatement away anyway. Their ABSENCE from the dark block is the assertion.
 *
 * "Mode-agnostic" is a statement about the MODE, not about the effect. The
 * retired declarations sat under `:not([data-theme="dark"])`, so outside that
 * selector the channel was not declared at all and its reader fell back or
 * failed to resolve. Authoring them on the body resolves them everywhere,
 * which is a real effective delta in the engines that read the sibling
 * spellings. Those deltas are graded SIGHTED_PENDING in the residual ledger
 * and asserted in section 4b — silence here would be a false green.
 */
const MODE_AGNOSTIC: readonly string[] = [
  "--ds-surface-radius-md",
  "--ds-shell-topbar-height",
  "--ds-shell-sidebar-width",
  "--ds-shell-sidebar-collapsed-width",
];

/**
 * The residual ledger's execution receipt for this tranche.
 *
 * Read, never written, from the test: the grading is owner-signed data and
 * this file is only allowed to prove it is true.
 */
type ClassicEffectiveDelta = {
  owner: string;
  channels: readonly string[];
  value: string;
  previousEffective: string;
  previousMechanism: "fallback" | "bare-read";
  reader: string;
  readerExpression: string;
  finalState: string;
};

const LEDGER = JSON.parse(
  readFileSync(
    join(process.cwd(), "src/foundation/tokens/residual-adjudication.json"),
    "utf8"
  )
) as {
  entries: Record<string, unknown>;
  finalStateVocabulary: { reconciliation: string };
  massC3BithireAllExecution: {
    classicEffectiveDeltas: readonly ClassicEffectiveDelta[];
  };
};

const CLASSIC_EFFECTIVE_DELTAS =
  LEDGER.massC3BithireAllExecution.classicEffectiveDeltas;

/** The two declarations the extension already scoped to dark. */
const PRE_DRAIN_DARK: Readonly<Record<string, string>> = {
  "--ds-color-info-ink": "var(--ds-color-info-300)",
  "--ds-select-dropdown-bg": "var(--ds-surface-card)",
};

// ── the compiled surfaces under test ───────────────────────────────────────

const compiledStatic = compileBrandTheme({
  brandTheme: bithireBrandTheme,
  tenantSlug: "bithire",
});
const BASE = compiledStatic.cssVariables;
const DARK =
  compiledStatic.modeBlocks?.find((block) => block.mode === "dark")
    ?.cssVariables ?? {};

/**
 * Compare ignoring whitespace only.
 *
 * The drained values carry the line breaks Prettier put inside `color-mix(`
 * and `linear-gradient(`; the compiler emits one line. Nothing else is
 * forgiven — a changed percentage, channel or fallback fails.
 */
const bare = (value: string | undefined) => (value ?? "").replace(/\s+/g, "");

/** Delete one keypath from a cloned BrandTheme. */
const withoutKeypath = (keypath: string): BrandTheme => {
  const clone = structuredClone(bithireBrandTheme) as unknown as Record<
    string,
    // The mutation walker is deliberately untyped: it must be able to remove a
    // field the contract declares as required-by-shape, which is the whole
    // point of the negative.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  const parts = keypath.split(".");
  let cursor: Record<string, unknown> | undefined = clone;
  for (const part of parts.slice(0, -1)) {
    cursor = cursor?.[part] as Record<string, unknown> | undefined;
  }
  if (!cursor) throw new Error(`keypath ${keypath} is already absent`);
  const leaf = parts[parts.length - 1];
  if (!(leaf in cursor)) throw new Error(`keypath ${keypath} is already absent`);
  delete cursor[leaf];
  return clone as unknown as BrandTheme;
};

const compileWithout = (keypath: string) => {
  const compiled = compileBrandTheme({
    brandTheme: withoutKeypath(keypath),
    tenantSlug: "bithire",
  });
  return {
    base: compiled.cssVariables,
    dark:
      compiled.modeBlocks?.find((block) => block.mode === "dark")
        ?.cssVariables ?? {},
  };
};

// ── 1. DRAIN ───────────────────────────────────────────────────────────────

// EXCISED (SEV-2): "MASS C3-BITHIRE-ALL · the extension declares nothing" —
// three tests that parsed `artifacts/bithire/_source/extension.css` for a
// zero-declaration census and asserted the FILE SURVIVED because the renderer
// embedded it. SEV-1 severed that embedding and SEV-2 deleted the file, so the
// third test now asserts the opposite of the law. The census claim is carried
// unconditionally by `scripts/first-party-single-author-gate.mjs` law G2: an
// absent file cannot be refilled, which a zero-declaration ratchet allowed.
// The classification table below is UNTOUCHED — it grades the 94 declarations
// this tranche drained against the compiled surface, and reads no file.

// ── 2. THE CLASSIFICATION TABLE ────────────────────────────────────────────

describe("MASS C3-BITHIRE-ALL · the table is the file that was drained", () => {
  it("94 declarations over 93 unique channels", () => {
    expect(DRAINED.length).toBe(94);
    expect(new Set(DRAINED.map((row) => row.name)).size).toBe(93);
  });

  it("the one repeated channel is the select dropdown, light and dark", () => {
    const seen = new Map<string, Scope[]>();
    for (const row of DRAINED) {
      seen.set(row.name, [...(seen.get(row.name) ?? []), row.scope]);
    }
    const repeated = [...seen.entries()].filter(
      ([, scopes]) => scopes.length > 1
    );
    expect(repeated).toEqual([
      ["--ds-select-dropdown-bg", ["dark", "light"]],
    ]);
  });

  it("every family census matches, and the censuses sum to 94", () => {
    const counted: Record<string, number> = {};
    for (const row of DRAINED) {
      counted[row.family] = (counted[row.family] ?? 0) + 1;
    }
    expect(counted).toEqual(FAMILY_SIZES);
    expect(
      Object.values(FAMILY_SIZES).reduce((sum, size) => sum + size, 0)
    ).toBe(94);
  });

  it("scope totals match the three blocks the stylesheet had", () => {
    const byScope = { base: 0, light: 0, dark: 0 };
    for (const row of DRAINED) byScope[row.scope]++;
    expect(byScope).toEqual({ base: 54, light: 38, dark: 2 });
  });
});

// ── 3. PARITY ──────────────────────────────────────────────────────────────

describe("MASS C3-BITHIRE-ALL · the common lowering emits every drained channel", () => {
  it.each(DRAINED.map((row) => [row.family, row.scope, row.name, row] as const))(
    "%s · %s · %s",
    (_family, scope, name, row) => {
      const emitted = scope === "dark" ? DARK[name] : BASE[name];
      expect(emitted, `${name} is not emitted at all`).toBeDefined();

      const forward = ALIAS_FORWARDS[name];
      if (forward) {
        // The alias' promise was "I am whatever that channel is". Graded
        // against the live compile of the target, never against a copy.
        expect(bare(row.extension)).toBe(bare(`var(${forward.target})`));
        expect(bare(emitted), forward.why).toBe(bare(BASE[forward.target]));
        return;
      }

      const removed = BRANCH_REMOVALS[name];
      if (removed) {
        expect(bare(emitted)).toBe(bare(removed));
        expect(row.extension).toContain("--rt-");
        expect(emitted).not.toContain("--rt-");
        return;
      }

      expect(bare(emitted)).toBe(bare(row.extension));
    }
  );

  it("exactly 13 channels moved their string, and they are the recorded 13", () => {
    const moved = DRAINED.filter((row) => {
      const emitted = row.scope === "dark" ? DARK[row.name] : BASE[row.name];
      return bare(emitted) !== bare(row.extension);
    }).map((row) => row.name);
    expect(moved.sort()).toEqual(
      [...Object.keys(ALIAS_FORWARDS), ...Object.keys(BRANCH_REMOVALS)].sort()
    );
  });
});

// ── 4. LIGHT / DARK PRESERVATION ───────────────────────────────────────────

describe("MASS C3-BITHIRE-ALL · dark keeps the paint it already had", () => {
  it("every formerly light-only paint channel carries an explicit dark pin", () => {
    const pinned: Record<string, string> = {};
    for (const name of Object.keys(DARK_PINS)) pinned[name] = DARK[name];
    expect(pinned).toEqual(DARK_PINS);
  });

  it("the mode-agnostic four are absent from the dark block", () => {
    // Present in the dark block would mean the compiler saw a DIFFERENT value
    // for dark — a restatement it could not diff away, i.e. a real repaint.
    for (const name of MODE_AGNOSTIC) {
      expect({ name, dark: DARK[name] }).toEqual({ name, dark: undefined });
    }
  });

  it("the geometry the ledger graded as an effective delta is emitted on the body", () => {
    // The grading is only honest if the value it names is the value the
    // compiler actually authors, in the scope that makes it reach dark.
    for (const row of CLASSIC_EFFECTIVE_DELTAS) {
      for (const channel of row.channels) {
        expect(BASE[channel], `${channel} body`).toBe(row.value);
        expect(DARK[channel], `${channel} dark`).toBeUndefined();
      }
    }
  });

  it("the two channels the extension already scoped to dark are unchanged", () => {
    for (const [name, value] of Object.entries(PRE_DRAIN_DARK)) {
      expect(bare(DARK[name]), name).toBe(bare(value));
    }
  });

  it("light is served by the body, because light is BitHire's default mode", () => {
    // `compileModeBlocks` throws on an overlay for the theme's own default
    // mode, so a `modes.light` block here would not be a style choice — it
    // would not compile. This is why the 38 live in the body.
    expect(bithireBrandTheme.appearance?.defaultMode).toBe("light");
    expect(bithireBrandTheme.modes?.light).toBeUndefined();
    expect(compiledStatic.colorScheme).toBe("light");
  });
});

// ── 4b. THE GRADED CLASSIC EFFECTIVE DELTAS ────────────────────────────────

describe("MASS C3-BITHIRE-ALL · the shell geometry deltas are graded, not silent", () => {
  it("the ledger carries exactly the two SIGHTED_PENDING rows for this tranche", () => {
    expect(CLASSIC_EFFECTIVE_DELTAS.map((row) => row.owner)).toEqual([
      "chrome.sidebar.width",
      "chrome.layout.headerHeight",
    ]);
    for (const row of CLASSIC_EFFECTIVE_DELTAS) {
      expect(row.finalState, row.owner).toBe("SIGHTED_PENDING");
    }
    // A row that grades nothing is not a grading. Every graded channel must
    // be one this tranche actually drained.
    const drained = new Set(DRAINED.map((row) => row.name));
    const graded = CLASSIC_EFFECTIVE_DELTAS.flatMap((row) => row.channels);
    expect(graded.filter((channel) => drained.has(channel)).length).toBeGreaterThan(0);
  });

  it("the recorded pre-drain resolution is read from the Classic source, not asserted in prose", () => {
    // Classic is NOT edited by this grading — it is the measuring instrument.
    // `fallback`: the reader spells its own default, so an undeclared channel
    // resolved to that literal. `bare-read`: no default at all, so an
    // undeclared channel made the whole declaration invalid at
    // computed-value time and the property fell to its initial value.
    for (const row of CLASSIC_EFFECTIVE_DELTAS) {
      const source = readFileSync(join(process.cwd(), row.reader), "utf8");
      expect(source, row.owner).toContain(row.readerExpression);
      if (row.previousMechanism === "fallback") {
        const fallbackRead = row.channels.find((channel) =>
          source.includes(`var(${channel}, ${row.previousEffective})`)
        );
        expect(fallbackRead, `${row.owner} fallback read`).toBeDefined();
      } else {
        expect(row.previousEffective, row.owner).toBe("unresolved");
        for (const channel of row.channels) {
          expect(
            new RegExp(`var\\(\\s*${channel.replace(/-/g, "\\-")}\\s*,`).test(source),
            `${channel} must have no fallback for the bare-read grading to hold`
          ).toBe(false);
        }
      }
    }
  });

  it("the delta is real: the new body value differs from what the reader used to resolve", () => {
    for (const row of CLASSIC_EFFECTIVE_DELTAS) {
      expect(row.value, row.owner).not.toBe(row.previousEffective);
      expect(row.value, row.owner).toMatch(/^\d+px$/);
    }
  });

  it("grading does not neutralize: no entries row was added and the census is untouched", () => {
    // The receipt is an execution record, not a census identity. If a future
    // pass "resolves" this by editing the 301-row distribution instead of
    // sighting the pixels, that is a different claim and must fail here.
    expect(Object.keys(LEDGER.entries)).toHaveLength(301);
    expect(LEDGER.finalStateVocabulary.reconciliation).toBe(
      "301 rows = 196 EXECUTED + 64 KEEP_ACTIVE + 35 OWNER_DECISION + 6 SIGHTED_PENDING"
    );
    for (const row of CLASSIC_EFFECTIVE_DELTAS) {
      for (const channel of row.channels) {
        expect(LEDGER.entries[channel], `${channel} must not become a census row`).toBeUndefined();
      }
    }
  });
});

// ── 5. ONE THEME SHAPE, ONE LOWERING ───────────────────────────────────────

describe("MASS C3-BITHIRE-ALL · static and Theme transports compile identically", () => {
  /**
   * `FIRST_PARTY_THEMES.bithire` is `brandThemeToTheme(bithireBrandTheme)`,
   * and `compileTheme` lowers it back through `themeToBrandTheme`. So this
   * comparison walks the whole iso round-trip: a new contract field that was
   * added to `BrandTheme` but forgotten in either iso direction — the exact
   * way a DB-transported theme silently loses a family — drops its channels
   * here and nowhere else.
   */
  const viaTheme = compileTheme(FIRST_PARTY_THEMES.bithire);
  const themeBase = viaTheme.cssVariables;
  const themeDark =
    viaTheme.modeBlocks?.find((block) => block.mode === "dark")?.cssVariables ??
    {};

  it("all 93 drained channels survive the Theme round-trip byte-identically", () => {
    for (const row of DRAINED) {
      const fromBrand = row.scope === "dark" ? DARK[row.name] : BASE[row.name];
      const fromTheme =
        row.scope === "dark" ? themeDark[row.name] : themeBase[row.name];
      expect({ name: row.name, value: fromTheme }).toEqual({
        name: row.name,
        value: fromBrand,
      });
    }
  });

  it("the three new families survive the round-trip value for value", () => {
    // The Theme side is the TOTAL shape — `brandThemeToTheme` fills every
    // field the contract declares, which is why the keysets are not compared
    // here. What must hold is that no AUTHORED value is lost or rewritten on
    // the way through, for each of the three families this tranche added.
    const roundTripped = FIRST_PARTY_THEMES.bithire;
    const authoredPairs: [string, Record<string, unknown>, Record<string, unknown>][] =
      [
        [
          "chrome.surface",
          (bithireBrandTheme.chrome?.surface ?? {}) as Record<string, unknown>,
          (roundTripped.chrome?.surface ?? {}) as Record<string, unknown>,
        ],
        [
          "chrome.premiumCard",
          (bithireBrandTheme.chrome?.premiumCard ?? {}) as Record<
            string,
            unknown
          >,
          (roundTripped.chrome?.premiumCard ?? {}) as Record<string, unknown>,
        ],
        [
          "chrome.controls.select",
          (bithireBrandTheme.chrome?.controls?.select ?? {}) as Record<
            string,
            unknown
          >,
          (roundTripped.chrome?.controls?.select ?? {}) as Record<
            string,
            unknown
          >,
        ],
      ];

    for (const [label, authored, total] of authoredPairs) {
      expect(Object.keys(authored).length, label).toBeGreaterThan(0);
      for (const [field, value] of Object.entries(authored)) {
        expect({ field: `${label}.${field}`, value: total[field] }).toEqual({
          field: `${label}.${field}`,
          value,
        });
      }
    }
  });
});

// ── 6. AUTHORITY (family-level resurrection negatives) ─────────────────────

/**
 * Delete the typed owner; the channels must go with it.
 *
 * Each row is `[owner keypath, channels that must disappear]`. A channel that
 * survives its owner's deletion is painted by something the drain did not
 * move, which would make the parity above a coincidence.
 */
const RESURRECTION: readonly (readonly [string, readonly string[]])[] = [
  [
    "chrome.badge",
    [
      "--ds-badge-default-bg",
      "--ds-badge-default-color",
      "--ds-badge-primary-bg",
      "--ds-badge-primary-color",
      "--ds-badge-secondary-bg",
      "--ds-badge-secondary-color",
      "--ds-badge-success-bg",
      "--ds-badge-success-color",
      "--ds-badge-warning-bg",
      "--ds-badge-warning-color",
      "--ds-badge-error-bg",
      "--ds-badge-error-color",
      "--ds-badge-info-bg",
      "--ds-badge-info-color",
      "--ds-badge-height",
      "--ds-badge-padding-x",
      "--ds-badge-line-height",
    ],
  ],
  [
    // One owner, both vocabularies: deleting `buttonError` takes the legacy
    // `danger` spelling with it.
    "chrome.controls.buttonError",
    [
      "--ds-button-error-bg",
      "--ds-button-error-bg-hover",
      "--ds-button-error-color",
      "--ds-button-error-border",
      "--ds-button-danger-bg",
      "--ds-button-danger-hover-bg",
      "--ds-button-danger-color",
      "--ds-button-danger-border",
    ],
  ],
  [
    "chrome.controls.buttonLink",
    [
      "--ds-button-link-color",
      "--ds-button-link-color-hover",
      "--ds-button-link-color-active",
    ],
  ],
  ["chrome.controls.buttonPrimary.bgActive", ["--ds-button-primary-bg-active"]],
  [
    "chrome.controls.buttonSecondary.bgActive",
    ["--ds-button-secondary-bg-active"],
  ],
  ["chrome.controls.buttonSuccess.color", ["--ds-button-success-color"]],
  ["chrome.controls.buttonWarning.color", ["--ds-button-warning-color"]],
  ["chrome.controls.buttonInfo.color", ["--ds-button-info-color"]],
  ["chrome.controls.input.borderColor", ["--ds-input-border-color"]],
  [
    "chrome.controls.select",
    [
      "--ds-select-bg",
      "--ds-select-bg-hover",
      "--ds-select-bg-focus",
      "--ds-select-color",
      "--ds-select-color-placeholder",
      "--ds-select-border-color",
      "--ds-select-border-color-hover",
      "--ds-select-border-color-focus",
      "--ds-select-dropdown-bg",
      "--ds-select-dropdown-border-color",
      "--ds-select-dropdown-shadow",
      "--ds-select-option-bg-hover",
      "--ds-select-option-bg-selected",
      "--ds-select-option-color",
      "--ds-select-option-color-selected",
    ],
  ],
  [
    "chrome.premiumCard",
    [
      "--ds-premium-card-bg",
      "--ds-premium-card-sheen",
      "--ds-premium-card-header-bg",
      "--ds-premium-card-section-bg",
      "--ds-premium-card-section-alt-bg",
      "--ds-premium-card-footer-bg",
      "--ds-premium-card-border",
      "--ds-premium-card-border-hover",
      "--ds-premium-card-selected-border",
      "--ds-premium-card-selected-ring",
    ],
  ],
  [
    // `chrome.surface` owns three drained families at once: the semantic
    // surface algebra, the card grid, and the popover/panel shadow trio.
    "chrome.surface",
    [
      "--ds-surface-radius-md",
      "--ds-surface-shadow",
      "--ds-surface-shadow-hover",
      "--ds-surface-icon-bg",
      "--ds-surface-icon-border",
      "--ds-surface-chip-bg",
      "--ds-card-side-accent-soft",
      "--ds-surface-card-grid-size",
      "--ds-surface-card-grid-line",
      "--ds-surface-card-grid-bg",
      "--ds-shadow-popover",
      "--ds-datepicker-panel-shadow",
      "--ds-timepicker-panel-shadow",
    ],
  ],
  [
    "chrome.detail",
    [
      "--ds-detail-hero-spine",
      "--ds-detail-control-bg",
      "--ds-detail-control-border",
      "--ds-detail-control-border-hover",
      "--ds-detail-continuous-boundary",
      "--ds-detail-continuous-surface",
    ],
  ],
  ["chrome.controls.focusRingColor", ["--ds-focus-ring-color"]],
  ["chrome.tooltip.zIndex", ["--ds-tooltip-z-index", "--ds-z-index-tooltip"]],
  ["chrome.table.rowFocusShadow", ["--ds-table-row-focus-shadow"]],
  ["chrome.sidebar.width", ["--ds-shell-sidebar-width", "--ds-sidebar-width"]],
  ["chrome.sidebar.collapsedWidth", ["--ds-shell-sidebar-collapsed-width"]],
  [
    "chrome.layout.headerHeight",
    [
      "--ds-shell-topbar-height",
      "--ds-shell-header-block-size",
      "--ds-layout-header-height",
    ],
  ],
];

describe("MASS C3-BITHIRE-ALL · the typed owner is the author", () => {
  it.each(RESURRECTION.map(([keypath, channels]) => [keypath, channels]))(
    "deleting %s removes its channels",
    (keypath, channels) => {
      const { base } = compileWithout(keypath as string);
      const survivors = (channels as readonly string[]).filter(
        (channel) => base[channel] !== undefined
      );
      expect(survivors).toEqual([]);
    }
  );

  it("deleting the dark info ink removes it from the dark block only", () => {
    const { base, dark } = compileWithout("modes.dark.palette.infoInkColor");
    expect(dark["--ds-color-info-ink"]).toBeUndefined();
    // It was dark-only to begin with, so the base block never had it.
    expect(base["--ds-color-info-ink"]).toBeUndefined();
    expect(DARK["--ds-color-info-ink"]).toBe("var(--ds-color-info-300)");
  });

  it("deleting the primary hover owner removes the legacy spelling and falls back to the derived floor", () => {
    // The canonical channel does NOT disappear: `--ds-button-primary-bg-hover`
    // has a palette derivation (`shadeSeed(primary, HOVER_LIGHTNESS_STEP)`)
    // underneath it. The authored value overrides that floor; the legacy
    // spelling has no floor at all, which is exactly why it must be emitted
    // from the same owner rather than hand-written.
    const { base } = compileWithout("chrome.controls.buttonPrimary.bgHover");
    expect(base["--ds-button-primary-hover-bg"]).toBeUndefined();
    expect(base["--ds-button-primary-bg-hover"]).toBe("#285D9D");
    expect(BASE["--ds-button-primary-bg-hover"]).toBe("#2C5587");
    expect(BASE["--ds-button-primary-hover-bg"]).toBe("#2C5587");
  });
});

// ── 7. THE THREE NEW FAMILIES ARE CROSS-VERTICAL ───────────────────────────

/**
 * A new semantic family is a capability, not a BitHire appendage.
 *
 * Same rule the C3-c control algebra follows: all three first-party themes
 * author the same keyset, each with its own values. The values are graded by
 * the parity tables above (bithire) and by each brand's own artifact; what is
 * graded here is that nobody is missing a channel the DS now considers part
 * of the family.
 */
describe("MASS C3-BITHIRE-ALL · every first-party theme authors the new families", () => {
  const THEMES = {
    rottay: rottayBrandTheme,
    bithire: bithireBrandTheme,
    evnto: evntoBrandTheme,
  };

  /**
   * `controls.select` is graded the same way `chrome.surface` is graded below,
   * and for the same reason.
   *
   * ROTTAY-T2 MASS migrated eighteen further select channels out of rottay's
   * extension into this family. BitHire and Evnto never declared those
   * channels, so there is nothing for them to migrate — authoring values there
   * would be inventing paint, not draining it. Their themes are untouched by
   * that tranche.
   *
   * So the law is: the C3 core is the identical fifteen-field vocabulary the
   * untouched verticals still carry, rottay is a DECLARED superset of
   * thirty-three, and every key any vertical authors is a declared field of the
   * single shared shape. A silent dialect still fails; a named migration does
   * not.
   */
  it("controls.select is one shared vocabulary, with rottay a declared superset", () => {
    const declared = Object.keys(
      DEFAULT_CHROME_SHAPE.controls?.select ?? {}
    ).sort();
    // A theme's select vocabulary is what it authors in the body PLUS what it
    // authors in its light overlay: a channel whose dark paint already equals
    // the DS floor is authored only for light, and it is still part of the
    // vocabulary. Grading the body alone would under-count by exactly those.
    const keysets = Object.entries(THEMES).map(
      ([id, theme]) =>
        [
          id,
          [
            ...new Set([
              ...Object.keys(theme.chrome?.controls?.select ?? {}),
              ...Object.keys(
                theme.modes?.light?.chrome?.controls?.select ?? {}
              ),
            ]),
          ].sort(),
        ] as const
    );

    // No dialect: every authored key is a declared field of the shared shape.
    for (const [id, keys] of keysets) {
      expect({
        id,
        undeclared: keys.filter((key) => !declared.includes(key)),
      }).toEqual({ id, undeclared: [] });
    }

    const byId = Object.fromEntries(keysets) as Record<string, string[]>;

    // The C3 core is exactly what the untouched verticals still carry, and it
    // is present in every vertical including the one T2 extended.
    expect(byId.bithire).toEqual(byId.evnto);
    expect(byId.bithire).toHaveLength(15);
    for (const [id, keys] of keysets) {
      expect({
        id,
        missingCore: (byId.bithire as string[]).filter(
          (key) => !keys.includes(key)
        ),
      }).toEqual({ id, missingCore: [] });
    }

    // Rottay's surplus is exactly the ROTTAY-T2 MASS migration, named — so a
    // future unexplained divergence still fails here.
    expect(byId.rottay).toHaveLength(33);
    expect(
      (byId.rottay as string[]).filter(
        (key) => !(byId.bithire as string[]).includes(key)
      )
    ).toEqual([
      "arrowColor",
      "bgDisabled",
      "border",
      "borderFocus",
      "borderHover",
      "checkColor",
      "clearColor",
      "clearColorHover",
      "colorDisabled",
      "dropdownBorder",
      "errorBorder",
      "filledBg",
      "optionColorDisabled",
      "shadowFocus",
      "successBorder",
      "tagBg",
      "tagColor",
      "warningBorder",
    ]);
  });

  /**
   * C3 introduced `chrome.surface` as a COMMON family: the point of the law is
   * that no vertical invents a private dialect, not that every vertical
   * authors an identical number of fields.
   *
   * ROTTAY-T1 later migrated six further channels out of rottay's extension
   * into this family. BitHire and Evnto never declared those channels, so
   * there is nothing to migrate for them — and authoring values there would be
   * inventing paint, not draining it.
   *
   * The law is therefore graded as it was always meant: the C3 core is shared
   * by all three, and every key any vertical authors is a declared field of
   * the single shared shape. That is strictly stronger than the old equal-
   * keyset pin, which could not tell a legitimate migration apart from a
   * dialect.
   */
  it("chrome.surface is one shared vocabulary across all three verticals", () => {
    const declared = Object.keys(DEFAULT_CHROME_SHAPE.surface ?? {}).sort();
    const keysets = Object.entries(THEMES).map(
      ([id, theme]) =>
        [id, Object.keys(theme.chrome?.surface ?? {}).sort()] as const
    );

    // No dialect: every authored key is a declared field of the shared shape.
    for (const [id, keys] of keysets) {
      expect({ id, undeclared: keys.filter((k) => !declared.includes(k)) })
        .toEqual({ id, undeclared: [] });
    }

    const byId = Object.fromEntries(keysets) as Record<string, string[]>;

    // The C3 core is exactly what the untouched verticals still carry, and it
    // is present in every vertical including the one T1 extended.
    expect(byId.bithire).toEqual(byId.evnto);
    expect(byId.bithire).toHaveLength(11);
    for (const [id, keys] of keysets) {
      expect({ id, missingCore: byId.bithire.filter((k) => !keys.includes(k)) })
        .toEqual({ id, missingCore: [] });
    }

    // Rottay's surplus is exactly the ROTTAY-T1 migration, named — so a future
    // unexplained divergence still fails here.
    expect(byId.rottay.filter((k) => !byId.bithire.includes(k))).toEqual([
      "cardCoverOverlayBg",
      "gradientDark",
      "imageOverlayBg",
      "overlayBg",
      "pageShellSubtitleColor",
      "watermarkColor",
    ]);
  });

  it("chrome.premiumCard has one keyset across all three verticals", () => {
    const keysets = Object.entries(THEMES).map(([id, theme]) => [
      id,
      Object.keys(theme.chrome?.premiumCard ?? {}).sort(),
    ]);
    const [, reference] = keysets[0] as [string, string[]];
    expect(reference).toHaveLength(10);
    for (const [id, keys] of keysets) expect({ id, keys }).toEqual({ id, keys: reference });
  });

  it("the common compiler emits the new families for all three verticals", () => {
    for (const [id, theme] of Object.entries(THEMES)) {
      const vars = compileBrandTheme({
        brandTheme: theme,
        tenantSlug: id,
      }).cssVariables;
      for (const channel of [
        "--ds-select-bg",
        "--ds-select-dropdown-shadow",
        "--ds-select-option-color-selected",
        "--ds-surface-radius-md",
        "--ds-surface-card-grid-bg",
        "--ds-shadow-popover",
        "--ds-premium-card-bg",
        "--ds-premium-card-selected-ring",
      ]) {
        expect(vars[channel], `${id} ${channel}`).toBeTruthy();
      }
    }
  });
});
