# Modern Customization Audit

Audit scope: `packages/core`, Modern engine, primitive path from contract to rendered UI.

This folder answers one question: if we keep adding more premium styling knobs, do Modern primitives actually read them all the way through the runtime, or do they stop at contracts, token maps, or bridge CSS?

## Executive Summary

1. The implemented premium source of truth today is `brandTheme`, not `appearance.general` / `appearance.advanced`.
2. Modern already has strong `--ds-*` coverage in several shells, especially core inputs and some display primitives.
3. Modern still has major bypasses in the foundation layer (`Box`, `Stack`, `Grid`, `Container`, `Divider`), so tenant styling does not fully reach the primitives everything else composes.
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

- `TenantAppearance` is declared and partially wired via `BrandTheme` runtime resolution; the legacy `appearance.general` / `appearance.advanced` paths remain unwired.
- The foundation layer is the biggest styling blocker because fixed Tailwind maps bypass tenant customization before higher-level primitives even render.
- Several Modern primitives look tokenized at first glance, but only their shell is tokenized; scalar size, density, popup motion, row styling, or interaction geometry still live in local maps.
- A future "100% customizable Modern" track should start with:
  1. foundation primitives
  2. dead bridge reconnection
  3. input contract parity
  4. navigation / feedback / overlay parity
  5. `appearance.general` / `appearance.advanced` runtime wiring
  6. regression guardrails proving that a token override changes real rendered output
