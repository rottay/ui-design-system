# WO-SKIN-06 CK-H1 — tenant and branding preview migration contract

Status: inert pre-step certified; migration ready (2026-07-14).

This contract supersedes the stale `237 / 37 runtime / 10 false-positive` headline in
`wo-skin-06-ck-h-inventory.md`. The fail-closed AST counter now excludes the two
`buildPaletteSteps()` return-type members, so the executable starting point is **235** sites:

| source                               |   start | final floor | migrate |
| ------------------------------------ | ------: | ----------: | ------: |
| `tenant-preview/engines/modern.tsx`  |      70 |          22 |      48 |
| `tenant-preview/engines/rustic.tsx`  |      75 |          14 |      61 |
| `branding-preview-sandbox/index.tsx` |      54 |           0 |      54 |
| `brand-studio/index.tsx`             |      36 |           9 |      27 |
| **CK-H1**                            | **235** |      **45** | **190** |

The 45-site floor is already executable in `roadmap/skin-exemptions.json`: 22 + 14 + 1
`SKIN-EXEMPT-RUNTIME-VALUE` sites and 8 `SKIN-EXEMPT-NOT-PAINT` sites. Floors are exact identities,
not a budget that another site may consume.

## 1. Scope and non-goals

Only these product sources and their focused tests/probes are in scope:

- `patterns/misc/tenant-preview/engines/{modern,rustic}.tsx`;
- `patterns/misc/branding-preview-sandbox/index.tsx`;
- `patterns/misc/brand-studio/index.tsx`.

`tenant-preview/engines/classic.tsx` is not migrated. CK-H2 is already certified. Generated tenant
CSS, the branding compiler, draft-theme data and the preview components' public props are not
redesigned.

This is Stage 1 extraction: preserve every value, fallback, alpha byte, selector outcome, DOM node,
conditional branch, engine asymmetry and consumer-style precedence. In particular, do **not** make
rustic tenant-preview use more of the tenant's chosen colour merely because modern currently does;
that product inconsistency is recorded for Stage 2.

## 2. Runtime and non-paint adjudication

The following sites remain at their current source locations:

- tenant-preview modern: the ten `buildPaletteSteps()` colour entries plus the twelve render sites
  that consume the tenant-derived palette/contrast values (**22**);
- tenant-preview rustic: the same ten palette entries plus its four tenant-derived render sites
  (**14**);
- brand-studio: `ColorField`'s live swatch background (**1**);
- brand-studio: the eight paint-shaped fields that build validation/theme-domain objects rather than
  DOM styles (**8**, `SKIN-EXEMPT-NOT-PAINT`).

No CSS selector or custom-property hatch is invented for those 45 sites. Tests must pin their
identity, not merely their count. All other counted paint is static or finite state-selected paint
and moves to a skin.

The following injected-CSS mechanisms are load-bearing and remain intact:

- tenant-preview's `generateTenantCss(...)` output and `data-tenant=<slug>` lifecycle;
- branding-preview-sandbox's `appearanceToVariables(...)` block scoped by `useId()`;
- brand-studio's `buildSurfaceVariables(...)` blocks scoped by `useId()`;
- brand-studio's static `.brand-studio-layout` container-query block.

They carry runtime custom properties or layout, not the 190 static paint declarations. They are not
to be globalized or renamed.

## 3. Scope classes and skin destinations

| component                | root scope                                             | skin                                                      |
| ------------------------ | ------------------------------------------------------ | --------------------------------------------------------- |
| tenant-preview modern    | existing `.ds-pattern-tenant-preview.ds-engine-modern` | `tokens/css/engines/modern/skin/tenant-preview.css`       |
| tenant-preview rustic    | existing `.ds-pattern-tenant-preview.ds-engine-rustic` | `tokens/css/engines/rustic/skin/tenant-preview.css`       |
| branding-preview-sandbox | add `.ds-pattern-branding-preview-sandbox`             | `tokens/css/components/skin/branding-preview-sandbox.css` |
| brand-studio             | add `.ds-pattern-brand-studio`                         | `tokens/css/components/skin/brand-studio.css`             |

All skins are unlayered and every rule is anchored to its component scope. There are no bare
`[data-part]` selectors. The two canonical CSS entrypoints are wired append-only by the orchestrator,
then all five tracked vertical bundles are regenerated.

## 4. Anatomy and state vocabulary

The pre-step stamps every element whose paint moves. The migration may refine names while reading
the full source, but it must retain this role/state vocabulary:

- tenant-preview: `root`, `header`, `logo`, `tenant-name`, `tenant-slug`, `palette`, `swatch`,
  `swatch-label`, `button`, `sample-card`, `accent-bar`, `preview-card-title`, `preview-card-body`, `sample-input`,
  `badge`, `sample-table`, `table-head`, `preview-table-cell`, `personality-tile`; use `data-palette`,
  `data-step`, `data-variant`, `data-status` where a finite branch chooses static leaves;
- branding-preview-sandbox: `root`, `header`, `logo`, `title`, `subtitle`, `nav`, `nav-item`,
  `button`, `card`, `preview-card-title`, `preview-card-body`, `input`, `badge`, `table`, `table-head`, `preview-table-cell`,
  `surface`; finite badge/button/nav branches use `data-variant`/`data-state`;
- brand-studio: `root`, `editor`, `section`, `field`, `field-label`, `field-input`, `color-swatch`,
  `preview-grid`, `preview-panel`, `preview-header`, `preview-content`, `preview-card`,
  `contrast-summary`, `contrast-row`, `violation`, `action`; use `data-surface`, `data-ground`,
  `data-state` and `data-severity` for finite authored branches.

Runtime values stay inline even when their element receives a `data-part`; the stamp identifies the
exception but does not move it.

Brand Studio's composed `Input` and `Select` engines do not all forward a consumer-provided
`data-part` to their host element. For `field-input`, the component-owned
`.ds-pattern-brand-studio__field-input` class is therefore the authoritative skin hook. CK-H1 CSS
must not depend on `[data-part="field-input"]` unless forwarding is normalized across every engine
and covered by a separate public contract.

The inert pre-step must prove both invariants before paint migration:

1. counters remain exactly `70 / 75 / 54 / 36`;
2. the attribute-stripped element tree is identical, including the `React.createElement` tree in
   branding-preview-sandbox.

The pre-step now satisfies both invariants: counters remain `70 / 75 / 54 / 36`, stripped AST
trees match the pre-step parents, focused component contracts are green, the production core and
Showroom builds are green, and all eight Rottay-dark/BitHire-light baselines passed two independent
no-update runs.

## 5. Specificity and precedence laws

- Preserve each component's existing caller `style` merge order. A local default that intentionally
  wins over caller style remains inline unless the contract test proves stylesheet extraction keeps
  the same precedence.
- Standard tenant-preview rules start from a two-class root. A single-class root is used for each
  engine-agnostic component; calculate specificity from the actual root rather than copying the
  tenant-preview recipe.
- Border-colour rules must beat the tenant universal floor. Colour on composed `Text`/Typography
  elements must beat the existing `(0,4,0)` text skin. Repeat the component-owned `data-part`
  selector only as many times as required; do not use `!important`.
- Preserve literal `background` versus `backgroundColor`, border shorthands, fallback nesting,
  `color-mix()` percentages and concatenated hex alpha bytes verbatim.
- Static lookup arrays are finite state, not runtime exemptions. Convert them to explicit data-state
  selectors without changing their values.

## 6. Contract and visual evidence

The focused contract must assert:

- exact post-migration counters `22 / 14 / 0 / 9` and exact checkpoint total **45**;
- identity of all 37 runtime-paint leaves and all eight non-paint domain-object leaves;
- all four scope roots and every selector-referenced `data-part`/state value exist;
- every rule is scope-anchored; `skins.parseErrors`, `skins.unwired`, `skins.deadParts` and
  `skins.exemptionsBreached` remain zero;
- generated tenant/appearance/surface CSS still mounts and cleans up with its original instance
  scoping;
- branding-preview-sandbox's `React.createElement` hierarchy and brand-studio's editor callbacks
  remain behaviorally intact.

The production showroom probe must pin both real tenant grounds and both tenant-preview engines,
plus branding-preview-sandbox and brand-studio on dark/light surfaces. It must explicitly exercise
all palette steps, static badge/button states, both brand-studio grounds and the live `ColorField`
swatch. Record pre-step baselines, then require two no-update passes after migration.

## 7. Exit gate

CK-H1 is certified only when:

- `235 -> 45` is reconciled exactly (`190` moved; no new exemption);
- focused tests, core typecheck/build and showroom production build are green;
- the engine audit and all audit-machinery tests are green;
- both CSS entrypoints and five generated bundles contain the four skins;
- the visual matrix passes twice against the pre-step baselines;
- the roadmap records the permanent runtime floors and the Stage-2 rustic-preview inconsistency
  without fixing it in this byte-exact pass.
