> Historical snapshot from an earlier audit. For current scores see quality-reset-audit/.

# Galactic Integration Rubric

Scope: `ui-design-system/packages/core`, `app-platform`, `app-evnto`, `app-bithire`.

Primary target: `Modern` as the MVP engine, with explicit attention to Rotate / `app-platform`.

Method: 10 specialist audit passes plus direct repo inspection. This folder is meant to answer one question:

> Can this Design System already act as the single truthful source for building highly differentiated product fronts, first-party verticals, and DB-backed runtime tenants?

Short answer:

- `Rotate / app-platform on Modern` is viable for MVP.
- The `brandTheme` path is strong.
- The `appearance` path is partially live but not yet the universal contract.
- Modern foundation is solid.
- Modern display, complex inputs, overlays, several patterns, and the app-platform tenant boundary still have important drift.
- Bundled first-party tenants and DB-backed tenants do not yet share one fully coherent model.

## Overall Grade

| Area | Score |
|---|---:|
| Runtime / theming / provider chain | 7.4 |
| Bundled verticals vs DB tenants | 5.2 |
| Premium contracts / appearance / brandTheme | 6.3 |
| Modern foundation / layout | 8.0 |
| Modern display / content | 5.0 |
| Modern inputs / forms | 5.6 |
| Modern navigation / feedback / overlay | 6.2 |
| Patterns / surfaces / structures | 6.4 |
| Hooks / system integration | 5.0 |
| Rotate / app-platform integration | 6.0 |
| Cross-vertical coherence | 6.7 |
| Non-functional quality | 6.3 |
| Docs / tests / guardrails / auditability | 6.4 |
| **Weighted overall** | **6.2 / 10** |

## What "Perfect" Means Here

For this audit, "perfect" does not mean "many tokens exist". It means all of the following are true at the same time:

1. A declared style/customization contract reaches real rendered output.
2. First-party bundled verticals are file-first and do not depend on DB branding for baseline identity.
3. Runtime DB tenants have a bounded, explicit contract that is intentionally smaller than bundled premium styling, unless advanced mode is present and validated.
4. Modern primitives, patterns, structures, hooks, tokens, and runtime compose into one coherent system rather than parallel layers.
5. App hosts do not quietly bypass the DS in the places users actually see.

## Top Conclusions

- The strongest path today is: `bundled tenant -> brandTheme -> modern/theme.css -> real shell/components`.
- The weakest path today is: `runtime DB tenant -> app-platform adapter -> partially legacy config -> partial runtime effect`.
- The most production-ready pieces are `Box`, `Stack`, `Grid`, `Container`, `Menu`, `Modal`, `Drawer`, `PageShell`, `useTokens`, responsive hooks, and the general DS provider chain.
- The highest-friction pieces are `Card`, `Carousel`, `Image`, `Statistic`, `Descriptions`, `QRCode`, `Slider`, `Upload`, `ColorPicker`, `CommandPalette`, `ShortcutsOverlay`, and app-platform's DB tenant boundary.

## Folder Map

- `00-methodology.md`
- `01-executive-scorecard.md`
- `02-master-rubric-matrix.md`
- `03-runtime-and-tenancy.md`
- `04-modern-foundation-and-display.md`
- `05-modern-inputs-and-forms.md`
- `06-modern-navigation-feedback-overlay.md`
- `07-hooks-surfaces-patterns.md`
- `08-premium-customization-and-appearance.md`
- `09-rotate-app-platform.md`
- `10-cross-verticals.md`
- `11-db-tenants-vs-bundled.md`
- `12-non-functional-quality.md`
- `13-testing-docs-guardrails.md`
- `14-wave-plan-for-claude.md`
- `15-agent-ledger.md`
- `16-claude-master-prompt.md`
- `17-10-10-action-plan.md`
- `18-claude-super-prompt.md`

## Recommended Reading Order

1. `01-executive-scorecard.md`
2. `11-db-tenants-vs-bundled.md`
3. `09-rotate-app-platform.md`
4. `04-modern-foundation-and-display.md`
5. `05-modern-inputs-and-forms.md`
6. `14-wave-plan-for-claude.md`
7. `17-10-10-action-plan.md`
8. `18-claude-super-prompt.md`
