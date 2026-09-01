# Master Rubric Matrix

This matrix uses 60 criteria across 12 domains.

## 1. Runtime / Theming / Provider Chain

| Criterion | Score | Notes |
|---|---:|---|
| Provider composition order | 8 | `DesignSystemProvider` composition is explicit and mostly sound. |
| Theme precedence clarity | 8 | `forceTheme`, tenant theme, appearance background mode, and fallbacks are clearer now. |
| Runtime token merge chain | 7 | Strong for `brandTheme`; `appearance` still not equally visible to every JS consumer. |
| CSS loading strategy clarity | 6 | Works for bundled hosts, brittle for generic multi-tenant hosts. |
| Runtime fallback resilience | 8 | Registry + static + remote + default is one of the strongest areas. |

## 2. Bundled Verticals vs DB Tenants

| Criterion | Score | Notes |
|---|---:|---|
| Bundled tenants file-first from route boundary | 4 | `app-platform` still fetches DB branding before stripping it later. |
| Bundled tenants protected from DB override | 7 | Provider gate now strips DB config for known tenants. |
| DB tenant contract clarity | 4 | Still too legacy and not explicitly bounded as core-first. |
| Bundled-vs-DB parity story | 5 | Same system in theory, different contracts in practice. |
| Documentation of the split | 6 | Intent exists, but docs and app behavior are not fully aligned. |

## 3. Premium Contracts / Appearance / brandTheme

| Criterion | Score | Notes |
|---|---:|---|
| `brandTheme` depth | 9 | Best premium path in the repo. |
| `appearance.general` live coverage | 7 | Several fields are live; still not universal. |
| `appearance.advanced` honesty | 6 | Narrower and more honest now, but still intentionally limited. |
| `brandThemeId` reality | 2 | Declared but not truly resolved/consumed. |
| Static/runtime parity | 4 | `appearance` still lives mainly in runtime provider, not static generator/preview. |

## 4. Modern Foundation / Layout

| Criterion | Score | Notes |
|---|---:|---|
| Box tokenization | 9 | One of the best end-to-end examples. |
| Stack / Grid / Container tokenization | 8 | Strong, canonical, and mostly utility-independent. |
| Density / spacing ownership | 8 | Good base after foundation work. |
| Radius / shadow ownership | 8 | Much healthier than before. |
| Rendered customization testing | 7 | Better than before, but still not universal across all layout primitives. |

## 5. Modern Display / Content

| Criterion | Score | Notes |
|---|---:|---|
| Card fidelity to declared tokens | 4 | Renderer still bypasses much of the token/bridge story. |
| Image fidelity to declared tokens | 4 | Uses local Tailwind/inline paths more than canonical DS bridge. |
| Statistic fidelity | 4 | Main render bypasses `--ds-statistic-*`. |
| Carousel / QRCode / Descriptions bridge alignment | 4 | Multiple contract/bridge/renderer splits remain. |
| Badge / Typography micro-metrics | 6 | Better than nothing, still not fully canonical. |

## 6. Modern Inputs / Forms

| Criterion | Score | Notes |
|---|---:|---|
| Core shell quality (`Input`, `Select`) | 8 | Strongest part of inputs. |
| Complex picker parity (`DatePicker`, `TimePicker`) | 6 | Good shell theming, contract still wider than runtime. |
| Popup / row / selected-state tokenization | 5 | Improved, not fully canonical. |
| Native / Daisy leakage control | 4 | `Slider`, `Upload`, `ColorPicker` still leak heavily. |
| Contract honesty across inputs | 5 | Many props remain only partially honored by Modern. |

## 7. Modern Navigation / Feedback / Overlay

| Criterion | Score | Notes |
|---|---:|---|
| Navigation token ownership | 6 | `Menu` is strong; `Link`, `Breadcrumb`, `Tabs`, `Stepper`, `Steps` still mixed. |
| Feedback token ownership | 6 | `Drawer` and parts of feedback are strong; `Skeleton` remains Daisy-heavy. |
| Overlay semantics | 5 | `Modal` is strong; `CommandPalette` and `ShortcutsOverlay` are weaker. |
| Keyboard / focus / ARIA quality | 5 | Important overlay semantics remain incomplete. |
| MVP visual coherence | 8 | Looks good enough for product, even where internals are messy. |

## 8. Patterns / Surfaces / Structures

| Criterion | Score | Notes |
|---|---:|---|
| PageShell quality | 9 | One of the strongest DS-owned visible layers. |
| ActivityLog / data structures | 7 | Good reuse of DS primitives. |
| NotificationCenter ownership | 5 | Token-colored, but still very local in geometry and behavior. |
| Surface/pattern reuse of DS primitives | 6 | Mixed: some excellent, some still app-ish. |
| Surface data integration | 5 | Data flow is still not truly DS-owned. |

## 9. Hooks / System Integration

| Criterion | Score | Notes |
|---|---:|---|
| `useTokens` / theme runtime | 9 | Clear infrastructure success case. |
| Responsive / motion / voice | 8 | Real adoption inside DS and apps. |
| Commands / search | 4 | Mounted, partially wired, still dormant in key product host. |
| Data / routing / state hooks | 3 | More app utilities than DS infrastructure. |
| Notifications / DnD / AI | 2 | Exported but not fused. |

## 10. Rotate / app-platform Host Integration

| Criterion | Score | Notes |
|---|---:|---|
| Public DS style imports | 9 | Correct and live. |
| Provider-stack coherence | 7 | Unified dashboard/auth path is solid. |
| Visible DS styling in shell | 8 | Real DS variable consumption is visible. |
| Host-owned bypass control | 4 | Too much visible shell and whitelabel logic still lives in the app. |
| Command/search activation | 2 | Registry-backed path is still dormant in the live host. |

## 11. Cross-Vertical Coherence

| Criterion | Score | Notes |
|---|---:|---|
| Root DS mounting across apps | 8 | All three apps mount DS cleanly. |
| Vertical/product-profile discipline | 8 | Good use of product profiles. |
| Shared tenant resolution model | 5 | `app-platform` is the outlier. |
| First-party vertical theming consistency | 7 | `app-evnto` and `app-bithire` are more coherent than `app-platform`. |
| Docs/showroom truthfulness across apps | 5 | Platform docs still muddy the Modern story. |

## 12. Non-Functional Quality + Docs/Guardrails

| Criterion | Score | Notes |
|---|---:|---|
| Runtime performance hygiene | 6 | Root token bridge still uses `JSON.stringify(tokens)`. |
| Accessibility / modal semantics | 5 | Key overlays still lag behind. |
| Resilience / fallback behavior | 8 | Fallback chain is strong. |
| Security-adjacent multi-tenant hygiene | 6 | Styling data is bounded but not strongly validated. |
| Docs / tests / guardrails truthfulness | 7 | Good scaffolding, still stale in key places. |

## Totals

| Summary | Score |
|---|---:|
| Mean of all 60 criteria | 6.2 |
| First-party vertical readiness | 7.1 |
| Runtime DB tenant readiness | 4.9 |
| Modern MVP readiness | 7.3 |
| "Galactic fully-customizable system" readiness | 5.6 |
