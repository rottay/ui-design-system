/**
 * @fileoverview The search-command-bar family: the workspace's command strip --
 * its raised pill shell, the command input and the `:has()` padding ladder that
 * tracks which overlay controls the voice cluster renders, the voice toggle and
 * its status lozenge, the microphone-permission drawer, the status line, and
 * the suggestion / actions slots beside it.
 *
 * @remarks
 * This namespace did not exist before WO-FAM-11 sub-lot D. The family read
 * twenty-two ROOT tokens and no channel of its own, so `readWithoutProducer`
 * measured 0 on a family a tenant could not reach at all -- the census recorded
 * that zero as a false green. The namespace is created here and the skin is
 * rewired onto it.
 *
 * Each produced value is the single chained fallback its skin reads it with, so
 * producing the name cannot move a pixel -- it changes WHO can reach the value,
 * not what it rests at. The contract suite pins the two texts equal, channel by
 * channel, across the whole namespace.
 *
 * Two values are canonicalised rather than transcribed, and each is the
 * cascade's own answer to a literal the file used to state itself: the status
 * lozenge reads `--ds-radius-full` instead of a bare `999px`, and the slot floor
 * reads `--ds-touch-target-min` instead of a bare `44px`.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/search-command-bar
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

export const searchCommandBarChromeDeriver: FamilyDeriver = {
  family: "search-command-bar",
  rank: "derived",
  consumes: ["surfaces.*", "palette.*", "shape.*", "density", "motion"],
  produces: [
    // The strip itself: the bar is chrome over the page ground, and its two surface variants.
    "--ds-search-command-bar-editorial-padding-block",
    "--ds-search-command-bar-editorial-padding-inline",
    "--ds-search-command-bar-embedded-padding-block",
    "--ds-search-command-bar-root-bg",
    "--ds-search-command-bar-root-padding-block",
    "--ds-search-command-bar-root-padding-inline",
    "--ds-search-command-bar-root-rule",
    "--ds-search-command-bar-z-index",
    // The top rail, the bar row and the input column measure.
    "--ds-search-command-bar-bar-row-gap",
    "--ds-search-command-bar-input-column-basis",
    "--ds-search-command-bar-top-rail-block-size",
    "--ds-search-command-bar-top-rail-editorial-block-size",
    "--ds-search-command-bar-top-rail-editorial-margin-block-end",
    "--ds-search-command-bar-top-rail-margin-block-end",
    // The raised pill shell, and the two frames a voice session paints on it.
    "--ds-search-command-bar-active-border",
    "--ds-search-command-bar-error-border",
    "--ds-search-command-bar-shell-bg",
    "--ds-search-command-bar-shell-border",
    "--ds-search-command-bar-shell-editorial-bg",
    "--ds-search-command-bar-shell-editorial-border",
    "--ds-search-command-bar-shell-editorial-padding",
    "--ds-search-command-bar-shell-editorial-radius",
    "--ds-search-command-bar-shell-editorial-shadow",
    "--ds-search-command-bar-shell-embedded-bg",
    "--ds-search-command-bar-shell-embedded-shadow",
    "--ds-search-command-bar-shell-padding",
    "--ds-search-command-bar-shell-radius",
    "--ds-search-command-bar-shell-shadow",
    // The search glyph and the command input, including the :has() padding ladder.
    "--ds-search-command-bar-icon-color",
    "--ds-search-command-bar-icon-inset-inline-start",
    "--ds-search-command-bar-input-bg",
    "--ds-search-command-bar-input-block-size",
    "--ds-search-command-bar-input-border",
    "--ds-search-command-bar-input-editorial-bg",
    "--ds-search-command-bar-input-editorial-block-size",
    "--ds-search-command-bar-input-editorial-border",
    "--ds-search-command-bar-input-editorial-radius",
    "--ds-search-command-bar-input-embedded-bg",
    "--ds-search-command-bar-input-font-size",
    "--ds-search-command-bar-input-padding-badge",
    "--ds-search-command-bar-input-padding-base",
    "--ds-search-command-bar-input-padding-both",
    "--ds-search-command-bar-input-padding-clear",
    "--ds-search-command-bar-input-padding-inline-start",
    "--ds-search-command-bar-input-padding-toggle",
    "--ds-search-command-bar-input-radius",
    // The voice cluster and the composed controls painted through the ghost channels.
    "--ds-search-command-bar-chip-bg-active",
    "--ds-search-command-bar-chip-bg-hover",
    "--ds-search-command-bar-chip-border-hover",
    "--ds-search-command-bar-chip-color-hover",
    "--ds-search-command-bar-clear-bg-hover",
    "--ds-search-command-bar-clear-color-hover",
    "--ds-search-command-bar-control-bg",
    "--ds-search-command-bar-control-border",
    "--ds-search-command-bar-control-color",
    "--ds-search-command-bar-focus-ring",
    "--ds-search-command-bar-quiet-bg-hover",
    "--ds-search-command-bar-quiet-border",
    "--ds-search-command-bar-quiet-color",
    "--ds-search-command-bar-quiet-color-hover",
    "--ds-search-command-bar-voice-gap",
    "--ds-search-command-bar-voice-inset-inline-end",
    "--ds-search-command-bar-voice-max-inline-size",
    "--ds-search-command-bar-voice-toggle-active-bg",
    "--ds-search-command-bar-voice-toggle-active-border",
    "--ds-search-command-bar-voice-toggle-active-color",
    "--ds-search-command-bar-voice-toggle-bg-hover",
    "--ds-search-command-bar-voice-toggle-color-hover",
    "--ds-search-command-bar-voice-toggle-error-bg",
    "--ds-search-command-bar-voice-toggle-error-border",
    "--ds-search-command-bar-voice-toggle-error-color",
    // The status lozenge and the two motions a voice session runs.
    "--ds-search-command-bar-badge-bg",
    "--ds-search-command-bar-badge-block-size",
    "--ds-search-command-bar-badge-border",
    "--ds-search-command-bar-badge-color",
    "--ds-search-command-bar-badge-error-bg",
    "--ds-search-command-bar-badge-error-border",
    "--ds-search-command-bar-badge-error-color",
    "--ds-search-command-bar-badge-gap",
    "--ds-search-command-bar-badge-label-font-size",
    "--ds-search-command-bar-badge-label-font-weight",
    "--ds-search-command-bar-badge-listening-color",
    "--ds-search-command-bar-badge-padding-inline",
    "--ds-search-command-bar-badge-radius",
    "--ds-search-command-bar-badge-transcribing-color",
    "--ds-search-command-bar-badge-warning-bg",
    "--ds-search-command-bar-badge-warning-border",
    "--ds-search-command-bar-badge-warning-color",
    "--ds-search-command-bar-pulse-duration",
    "--ds-search-command-bar-pulse-easing",
    "--ds-search-command-bar-pulse-fade",
    "--ds-search-command-bar-pulse-tint",
    "--ds-search-command-bar-spin-duration",
    // The microphone-permission drawer: a warning-framed sheet under the shell.
    "--ds-search-command-bar-voice-help-bg",
    "--ds-search-command-bar-voice-help-blocked-border",
    "--ds-search-command-bar-voice-help-border",
    "--ds-search-command-bar-voice-help-description-color",
    "--ds-search-command-bar-voice-help-description-font-size",
    "--ds-search-command-bar-voice-help-description-line-height",
    "--ds-search-command-bar-voice-help-description-margin",
    "--ds-search-command-bar-voice-help-enter-duration",
    "--ds-search-command-bar-voice-help-enter-easing",
    "--ds-search-command-bar-voice-help-footer-margin",
    "--ds-search-command-bar-voice-help-hint-color",
    "--ds-search-command-bar-voice-help-hint-font-size",
    "--ds-search-command-bar-voice-help-hint-line-height",
    "--ds-search-command-bar-voice-help-inline-size",
    "--ds-search-command-bar-voice-help-list-color",
    "--ds-search-command-bar-voice-help-list-font-size",
    "--ds-search-command-bar-voice-help-list-line-height",
    "--ds-search-command-bar-voice-help-list-margin-block",
    "--ds-search-command-bar-voice-help-list-padding-inline-start",
    "--ds-search-command-bar-voice-help-offset",
    "--ds-search-command-bar-voice-help-padding",
    "--ds-search-command-bar-voice-help-radius",
    "--ds-search-command-bar-voice-help-shadow",
    "--ds-search-command-bar-voice-help-step-gap",
    "--ds-search-command-bar-voice-help-title-font-size",
    "--ds-search-command-bar-voice-help-z-index",
    // The status line under the input.
    "--ds-search-command-bar-status-color",
    "--ds-search-command-bar-status-error-color",
    "--ds-search-command-bar-status-font-size",
    "--ds-search-command-bar-status-line-height",
    "--ds-search-command-bar-status-listening-color",
    "--ds-search-command-bar-status-row-margin",
    "--ds-search-command-bar-status-transcribing-color",
    // The side cluster: the suggestion strip, the actions slot and the rule below.
    "--ds-search-command-bar-divider-block-size",
    "--ds-search-command-bar-divider-fill",
    "--ds-search-command-bar-divider-margin",
    "--ds-search-command-bar-side-cluster-gap",
    "--ds-search-command-bar-side-cluster-padding-block-start",
    "--ds-search-command-bar-side-cluster-row-gap",
    "--ds-search-command-bar-slot-editorial-padding-inline-start",
    "--ds-search-command-bar-slot-editorial-rule",
    "--ds-search-command-bar-slot-padding-block",
    "--ds-search-command-bar-slot-padding-inline-start",
    "--ds-search-command-bar-slot-rule",
    "--ds-search-command-bar-slot-touch-target",
    "--ds-search-command-bar-suggestions-gap",
    "--ds-search-command-bar-suggestions-label-color",
    "--ds-search-command-bar-suggestions-label-font-size",
    "--ds-search-command-bar-suggestions-label-font-weight",
    "--ds-search-command-bar-suggestions-label-letter-spacing",
  ],
  derive: () => deriveSearchCommandBarChannels(),
};

export function deriveSearchCommandBarChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The strip itself: the bar is chrome over the page ground, and its two surface variants.
  vars["--ds-search-command-bar-editorial-padding-block"] = "2px 10px";
  vars["--ds-search-command-bar-editorial-padding-inline"] = "20px";
  vars["--ds-search-command-bar-embedded-padding-block"] = "8px";
  vars["--ds-search-command-bar-root-bg"] = "var(--ds-surface-card)";
  vars["--ds-search-command-bar-root-padding-block"] = "10px 12px";
  vars["--ds-search-command-bar-root-padding-inline"] = "16px";
  vars["--ds-search-command-bar-root-rule"] = "1px solid var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-z-index"] = "30";

  // The top rail, the bar row and the input column measure.
  vars["--ds-search-command-bar-bar-row-gap"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-search-command-bar-input-column-basis"] = "720px";
  vars["--ds-search-command-bar-top-rail-block-size"] = "22px";
  vars["--ds-search-command-bar-top-rail-editorial-block-size"] = "24px";
  vars["--ds-search-command-bar-top-rail-editorial-margin-block-end"] = "8px";
  vars["--ds-search-command-bar-top-rail-margin-block-end"] = "6px";

  // The raised pill shell, and the two frames a voice session paints on it.
  vars["--ds-search-command-bar-active-border"] = "1px solid var(--ds-color-primary)";
  vars["--ds-search-command-bar-error-border"] = "1px solid var(--ds-color-error)";
  vars["--ds-search-command-bar-shell-bg"] = "var(--ds-surface-panel)";
  vars["--ds-search-command-bar-shell-border"] = "1px solid var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-shell-editorial-bg"] = "linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-panel) 82%, transparent) 0%, color-mix(in srgb, var(--ds-surface-panel) 68%, transparent) 100%)";
  vars["--ds-search-command-bar-shell-editorial-border"] = "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 78%, transparent)";
  vars["--ds-search-command-bar-shell-editorial-padding"] = "5px";
  vars["--ds-search-command-bar-shell-editorial-radius"] = "calc(var(--ds-radius-lg, 12px) * 1.5)";
  vars["--ds-search-command-bar-shell-editorial-shadow"] = "0 10px 28px color-mix(in srgb, var(--ds-color-primary) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 58%, transparent)";
  vars["--ds-search-command-bar-shell-embedded-bg"] = "color-mix(in srgb, var(--ds-surface-panel) 76%, transparent)";
  vars["--ds-search-command-bar-shell-embedded-shadow"] = "0 12px 28px color-mix(in srgb, var(--ds-color-primary) 10%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 52%, transparent)";
  vars["--ds-search-command-bar-shell-padding"] = "6px";
  vars["--ds-search-command-bar-shell-radius"] = "calc(var(--ds-radius-lg, 12px) * 1.25)";
  vars["--ds-search-command-bar-shell-shadow"] = "var(--ds-elevation-1)";

  // The search glyph and the command input, including the :has() padding ladder.
  vars["--ds-search-command-bar-icon-color"] = "var(--ds-color-text-muted)";
  vars["--ds-search-command-bar-icon-inset-inline-start"] = "24px";
  vars["--ds-search-command-bar-input-bg"] = "var(--ds-surface-panel)";
  vars["--ds-search-command-bar-input-block-size"] = "42px";
  vars["--ds-search-command-bar-input-border"] = "1px solid var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-input-editorial-bg"] = "color-mix(in srgb, var(--ds-surface-panel) 78%, transparent)";
  vars["--ds-search-command-bar-input-editorial-block-size"] = "var(--ds-touch-target-min, 44px)";
  vars["--ds-search-command-bar-input-editorial-border"] = "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 58%, transparent)";
  vars["--ds-search-command-bar-input-editorial-radius"] = "calc(var(--ds-radius-lg, 12px) * 1.5)";
  vars["--ds-search-command-bar-input-embedded-bg"] = "color-mix(in srgb, var(--ds-surface-panel) 84%, transparent)";
  vars["--ds-search-command-bar-input-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-search-command-bar-input-padding-badge"] = "244px";
  vars["--ds-search-command-bar-input-padding-base"] = "14px";
  vars["--ds-search-command-bar-input-padding-both"] = "278px";
  vars["--ds-search-command-bar-input-padding-clear"] = "122px";
  vars["--ds-search-command-bar-input-padding-inline-start"] = "46px";
  vars["--ds-search-command-bar-input-padding-toggle"] = "88px";
  vars["--ds-search-command-bar-input-radius"] = "var(--ds-radius-xl, 16px)";

  // The voice cluster and the composed controls painted through the ghost channels.
  vars["--ds-search-command-bar-chip-bg-active"] = "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-panel))";
  vars["--ds-search-command-bar-chip-bg-hover"] = "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-surface-panel))";
  vars["--ds-search-command-bar-chip-border-hover"] = "color-mix(in srgb, var(--ds-color-primary) 30%, transparent)";
  vars["--ds-search-command-bar-chip-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-search-command-bar-clear-bg-hover"] = "color-mix(in srgb, var(--ds-color-bg-primary) 60%, transparent)";
  vars["--ds-search-command-bar-clear-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-search-command-bar-control-bg"] = "var(--ds-surface-panel)";
  vars["--ds-search-command-bar-control-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-control-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-search-command-bar-focus-ring"] = "0 0 0 var(--ds-focus-ring-width, 2px) var(--ds-focus-ring-color, color-mix(in srgb, var(--ds-color-primary) 55%, transparent))";
  vars["--ds-search-command-bar-quiet-bg-hover"] = "color-mix(in srgb, var(--ds-color-bg-primary) 55%, transparent)";
  vars["--ds-search-command-bar-quiet-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-quiet-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-search-command-bar-quiet-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-search-command-bar-voice-gap"] = "8px";
  vars["--ds-search-command-bar-voice-inset-inline-end"] = "18px";
  vars["--ds-search-command-bar-voice-max-inline-size"] = "min(48%, 304px)";
  vars["--ds-search-command-bar-voice-toggle-active-bg"] = "color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card))";
  vars["--ds-search-command-bar-voice-toggle-active-border"] = "var(--ds-color-primary)";
  vars["--ds-search-command-bar-voice-toggle-active-color"] = "var(--ds-color-primary)";
  vars["--ds-search-command-bar-voice-toggle-bg-hover"] = "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-panel))";
  vars["--ds-search-command-bar-voice-toggle-color-hover"] = "var(--ds-color-primary)";
  vars["--ds-search-command-bar-voice-toggle-error-bg"] = "color-mix(in srgb, var(--ds-color-error) 10%, var(--ds-surface-card))";
  vars["--ds-search-command-bar-voice-toggle-error-border"] = "var(--ds-color-error)";
  vars["--ds-search-command-bar-voice-toggle-error-color"] = "var(--ds-color-error)";

  // The status lozenge and the two motions a voice session runs.
  vars["--ds-search-command-bar-badge-bg"] = "var(--ds-surface-panel)";
  vars["--ds-search-command-bar-badge-block-size"] = "24px";
  vars["--ds-search-command-bar-badge-border"] = "1px solid var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-badge-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-search-command-bar-badge-error-bg"] = "color-mix(in srgb, var(--ds-color-error) 8%, transparent)";
  vars["--ds-search-command-bar-badge-error-border"] = "1px solid var(--ds-color-error)";
  vars["--ds-search-command-bar-badge-error-color"] = "var(--ds-color-error)";
  vars["--ds-search-command-bar-badge-gap"] = "6px";
  vars["--ds-search-command-bar-badge-label-font-size"] = "var(--ds-font-size-2xs, var(--ds-font-size-xs))";
  vars["--ds-search-command-bar-badge-label-font-weight"] = "var(--ds-font-weight-semibold, 600)";
  vars["--ds-search-command-bar-badge-listening-color"] = "var(--ds-color-primary)";
  vars["--ds-search-command-bar-badge-padding-inline"] = "8px";
  vars["--ds-search-command-bar-badge-radius"] = "var(--ds-radius-full, 9999px)";
  vars["--ds-search-command-bar-badge-transcribing-color"] = "var(--ds-color-warning)";
  vars["--ds-search-command-bar-badge-warning-bg"] = "color-mix(in srgb, var(--ds-color-warning) 8%, transparent)";
  vars["--ds-search-command-bar-badge-warning-border"] = "1px solid var(--ds-color-warning)";
  vars["--ds-search-command-bar-badge-warning-color"] = "var(--ds-color-warning)";
  vars["--ds-search-command-bar-pulse-duration"] = "1.6s";
  vars["--ds-search-command-bar-pulse-easing"] = "ease-out";
  vars["--ds-search-command-bar-pulse-fade"] = "color-mix(in srgb, var(--ds-color-primary) 0%, transparent)";
  vars["--ds-search-command-bar-pulse-tint"] = "color-mix(in srgb, var(--ds-color-primary) 22%, transparent)";
  vars["--ds-search-command-bar-spin-duration"] = "1s";

  // The microphone-permission drawer: a warning-framed sheet under the shell.
  vars["--ds-search-command-bar-voice-help-bg"] = "var(--ds-surface-card)";
  vars["--ds-search-command-bar-voice-help-blocked-border"] = "1px solid var(--ds-color-error)";
  vars["--ds-search-command-bar-voice-help-border"] = "1px solid var(--ds-color-warning)";
  vars["--ds-search-command-bar-voice-help-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-search-command-bar-voice-help-description-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-search-command-bar-voice-help-description-line-height"] = "var(--ds-line-height-normal, 1.5)";
  vars["--ds-search-command-bar-voice-help-description-margin"] = "4px";
  vars["--ds-search-command-bar-voice-help-enter-duration"] = "var(--ds-motion-normal, 200ms)";
  vars["--ds-search-command-bar-voice-help-enter-easing"] = "var(--ds-motion-ease-out, ease-out)";
  vars["--ds-search-command-bar-voice-help-footer-margin"] = "16px";
  vars["--ds-search-command-bar-voice-help-hint-color"] = "var(--ds-color-text-muted)";
  vars["--ds-search-command-bar-voice-help-hint-font-size"] = "var(--ds-font-size-2xs, var(--ds-font-size-xs))";
  vars["--ds-search-command-bar-voice-help-hint-line-height"] = "1.45";
  vars["--ds-search-command-bar-voice-help-inline-size"] = "min(420px, calc(100dvw - 32px))";
  vars["--ds-search-command-bar-voice-help-list-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-search-command-bar-voice-help-list-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-search-command-bar-voice-help-list-line-height"] = "1.55";
  vars["--ds-search-command-bar-voice-help-list-margin-block"] = "12px 0";
  vars["--ds-search-command-bar-voice-help-list-padding-inline-start"] = "18px";
  vars["--ds-search-command-bar-voice-help-offset"] = "calc(100% + 12px)";
  vars["--ds-search-command-bar-voice-help-padding"] = "18px";
  vars["--ds-search-command-bar-voice-help-radius"] = "calc(var(--ds-radius-lg, 12px) * 1.5)";
  vars["--ds-search-command-bar-voice-help-shadow"] = "var(--ds-elevation-2)";
  vars["--ds-search-command-bar-voice-help-step-gap"] = "6px";
  vars["--ds-search-command-bar-voice-help-title-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-search-command-bar-voice-help-z-index"] = "180";

  // The status line under the input.
  vars["--ds-search-command-bar-status-color"] = "var(--ds-color-text-muted)";
  vars["--ds-search-command-bar-status-error-color"] = "var(--ds-color-error)";
  vars["--ds-search-command-bar-status-font-size"] = "var(--ds-font-size-2xs, var(--ds-font-size-xs))";
  vars["--ds-search-command-bar-status-line-height"] = "1.45";
  vars["--ds-search-command-bar-status-listening-color"] = "var(--ds-color-primary)";
  vars["--ds-search-command-bar-status-row-margin"] = "6px";
  vars["--ds-search-command-bar-status-transcribing-color"] = "var(--ds-color-warning)";

  // The side cluster: the suggestion strip, the actions slot and the rule below.
  vars["--ds-search-command-bar-divider-block-size"] = "var(--ds-border-width-1, 1px)";
  vars["--ds-search-command-bar-divider-fill"] = "linear-gradient(90deg, color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent) 0%, color-mix(in srgb, var(--ds-color-border-subtle) 34%, transparent) 44%, transparent 100%)";
  vars["--ds-search-command-bar-divider-margin"] = "10px";
  vars["--ds-search-command-bar-side-cluster-gap"] = "18px";
  vars["--ds-search-command-bar-side-cluster-padding-block-start"] = "2px";
  vars["--ds-search-command-bar-side-cluster-row-gap"] = "8px";
  vars["--ds-search-command-bar-slot-editorial-padding-inline-start"] = "16px";
  vars["--ds-search-command-bar-slot-editorial-rule"] = "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)";
  vars["--ds-search-command-bar-slot-padding-block"] = "6px";
  vars["--ds-search-command-bar-slot-padding-inline-start"] = "18px";
  vars["--ds-search-command-bar-slot-rule"] = "1px solid var(--ds-color-border-subtle)";
  vars["--ds-search-command-bar-slot-touch-target"] = "var(--ds-touch-target-min, 44px)";
  vars["--ds-search-command-bar-suggestions-gap"] = "10px";
  vars["--ds-search-command-bar-suggestions-label-color"] = "var(--ds-color-text-muted)";
  vars["--ds-search-command-bar-suggestions-label-font-size"] = "var(--ds-font-size-2xs, var(--ds-font-size-xs))";
  vars["--ds-search-command-bar-suggestions-label-font-weight"] = "var(--ds-font-weight-bold, 700)";
  vars["--ds-search-command-bar-suggestions-label-letter-spacing"] = "var(--ds-text-eyebrow-letter-spacing, 0.08em)";

  return vars;
}
