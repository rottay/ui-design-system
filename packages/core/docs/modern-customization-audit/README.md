> Status: Complete. Waves M1-M10, F1-F7, A0-A9 all landed.

# Modern Customization Audit

Audit scope: `packages/core`, Modern engine, primitive path from contract to rendered UI.

This folder answers one question: if we keep adding more premium styling knobs, do Modern primitives actually read them all the way through the runtime, or do they stop at contracts, token maps, or bridge CSS?

## Executive Summary

1. `brandTheme` is the richest premium source for bundled verticals. `appearance.general` is the primary DB contract for runtime tenants. Both are wired into runtime.
2. Modern has strong `--ds-*` coverage across foundation, inputs, display, and navigation primitives after M1-M9 + A4-A6 waves.
3. Foundation layer tokenization is complete (M1): Box/Stack/Grid/Container/Divider all resolve through CSS custom properties.
4. `modern/theme.css` contains bridge selectors that several Modern primitives never emit, leaving part of the theme layer effectively dead.
5. Inputs are the healthiest category overall, but many still ignore adjacent token maps, hardcode geometry/motion, or delegate key states to DaisyUI/native widgets.
6. Navigation, feedback, and overlay primitives rarely read `personality` or chrome in a first-class way. They mostly consume raw CSS vars or library defaults.

## What Is In This Folder

- `00-runtime-pipeline.md`
  Runtime truth: implemented merge chain, target model, and where the current system stops.
- `01-modern-display-layout.md`
  Audit of Modern display + layout primitives.
- `02-modern-inputs.md`
  Audit of Modern input primitives.
- `03-modern-navigation-feedback-overlay.md`
  Audit of Modern navigation, feedback, and overlay primitives.
- `04-wave-plan.md`
  Concrete implementation waves, acceptance criteria, and ordering.
- `05-claude-prompt.md`
  Ready-to-send implementation prompt for Claude.

## High-Priority Conclusions

- `TenantAppearance` is wired into runtime: DSP resolves `config.appearance`, ThemeProvider injects vars, useTokens reads density. Static generator also supports appearance (A3).
- Foundation tokenization was completed in M1: Box/Stack/Grid/Container/Divider now use `var(--ds-spacing-*)`, `var(--ds-radius-*)`, `var(--ds-elevation-*)`.
- Most high-value Modern primitives are now token-governed (M1-M9, A4-A6). Remaining gaps are in lower-priority primitives.
- Completed tracks: M1-M10 (Modern customization), F1-F7 (Codex fixes), A0-A9 (10/10 program). See `04-wave-plan.md` for status.
