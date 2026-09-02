# DT Consensus — Universal Token System and Extension Severance

- Date: 2026-08-14
- Inputs: Fable and Kimi K3 massive token-system audits in this directory.
- Authority: owner laws + the live Design System tree.
- Scope: `packages/core` Design System. Applications and Showroom are consumers,
  never token-contract authorities or blockers.
- Execution: Kimi 2.7 implements; Fable and Kimi K3 audit; Codex acts as DT.
- Repository policy: leave every change unstaged and uncommitted. No push. No R7.

## Binding destination

1. Static and DDB are transports only.
2. Both transports resolve to the same fully resolved, nested-total `Theme`.
3. `ThemePatch` exists only at ingestion. It never reaches the compiler.
4. Exactly one `compileTheme(theme: Theme)` lowers semantic intent.
5. Equivalent values produce identical keypaths, channel inventory, order, CSS,
   serialization and digest, regardless of transport.
6. Metadata such as id, slug, source and row version never influences lowering.
7. Rottay, BitHire and Evnto have the same Theme structure, nested keypaths,
   ordering and semantic section comments. Only values and explicit capability
   dispositions differ.
8. `--ds-*` is the canonical channel namespace. Its existence does not make a
   channel a product control: the product surface remains the bounded
   Standard/Pro controls plus the closed Expert allowlist. `--_ds-*` is the
   governed private/provisional namespace for family sockets; it is legal only
   with an owner, producer, fallback, productive consumer and an explicit
   promotion/derivation/retirement disposition. `data-*` is the governed DOM
   attribute axis, not a token namespace. Product or vertical dialects
   (`event`, `ticket`, `dashboard`, `--rt-*`, slug-derived names) are forbidden
   in both token namespaces, contracts and Theme keypaths.
9. `_source/extension.css` is temporary debt, not an authority. All 1,224 live
   declarations must migrate, universalize or delete; then the API and files are
   removed.
10. The active Modern Rescue manifest (255 families / 5,100 control-family
    cells) is reconciled only after channel identities and ownership stabilize.

## Audit consensus

Both auditors independently agree on:

- live extension census: Rottay 1,027; BitHire 172; Evnto 25; total 1,224;
- current dual lowering is invalid;
- the static/DDB subset test certifies the wrong law and must be replaced by
  total transport equality;
- the first-party themes are not structural mirrors today;
- forbidden product vocabulary remains live;
- extension rendering/build API must be severed after the drain;
- apps do not authorize or block DS normalization;
- the manifest cannot honestly advance while extension CSS bypasses its
  semantic control model.

The operational product model remains 13 Standard controls plus 7 Pro
capabilities through point-zero certification. The proposed 9 Standard + 7 Pro
taxonomy is not operational and may replace predecessors only through a later
atomic migration. Expert remains a closed 294-channel allowlist with at most
200 overrides per document; it is not a token browser over the full corpus.

Existing `--_ds-*` sockets are not extension debt and are not automatically
illegal. Before point zero each one must be represented as governed private
plumbing with liveness and fallback evidence, promoted atomically to canon,
derived away, or retired with death proof. A drain cohort may not move an
extension declaration into `--_ds-*` merely to defer that decision. The Expert
allowlist is frozen during the drain unless the owner separately authorizes a
bounded addition.

## DT rulings on differences

### Component channels

Kimi K3's derivation direction wins over adding hundreds of flat Theme leaves.
Component channels are outputs of universal semantic roles and recipes. A Theme
authors intent; `compileTheme` derives component channels deterministically.

An explicit Theme field is allowed only when it represents a reusable,
product-agnostic decision that cannot be derived without losing authored intent.
Every such field must exist in all three Theme sources at the same keypath and
position. No open token map or vertical switch is permitted.

### Theme completeness

Fable's total-input compiler law wins. `Theme` is resolved and total;
`ThemePatch` is recursive partial input only. Unknown keys, missing vertical
base, missing dispositions and invalid schema versions fail closed.

Static first-party themes are complete Themes. DDB documents migrate to a patch,
resolve over the selected complete first-party Theme, and enter the same
`compileTheme` binding. No invented neutral Theme and no silent default vertical.

### Generated artifacts

No build or generated rewrite per source cohort. Source cohorts prove value
preservation with in-memory compilation, signed effective maps and digest
invariance. The existing conflict fence preserves attribution. One coordinated
generated/build/pack/browser tranche runs only after source authority is singular.

### SEV receipt microfix

Fable's audit is authoritative for the existing `SEV-RECEIPT-MODE` microfix:
ACCEPT, P0=0/P1=0, mode hash `191837a2...`, focal 106/106, tests tsc 0 and
provenance gate 0. Kimi K3's section 12 is rejected because it misread the atom
name as a request for a new severity taxonomy. No new SEV taxonomy is adopted.

## Mass implementation programme

### T0 — THEME-ISO (architectural prerequisite)

- introduce total `Theme`, ingestion-only `ThemePatch` and `ThemePatchEnvelope`;
- add fail-closed `resolveTheme` and v1 document migration;
- converge both transports on the same `compileTheme` binding;
- remove DDB emission through the second lowering;
- mirror the three first-party Theme sources structurally;
- replace subset/intersection tests with exact inventory/keypath/order/CSS/digest
  equality and round-trip tests;
- add a hard name law that permits only product-agnostic `--ds-*` emissions and
  forbids `--_ds-*` in Theme keypaths/compiler output while continuing to allow
  governed `--_ds-*` family-private sockets below the tenant pipeline;
- keep existing effective values and digests invariant;
- do not touch extension declarations or generated artifacts in this tranche.

### T1 — Foundation and derivation law

- alpha/ramp derivations;
- surfaces, borders, focus, radius, shadows, elevation, gradients and overlays;
- calibrate one representative component family to prove semantic-role to
  component-channel derivation for all three Themes and both modes.

### T2–T6 — Parallel disjoint component cohorts

- T2 inputs/forms: input, textarea, select, autocomplete, date/time pickers,
  input-number, checkbox, radio, switch, toggle, slider, upload and transfer;
- T3 feedback/overlay: alert, message, notification, progress, result, skeleton,
  spinner, tag, tooltip, popover, drawer and collapse;
- T4 navigation/shell: menu, dropdown, breadcrumb, pagination, steps, tabs,
  sidebar, shell and layout chrome;
- T5 data/display: table, list, tree, descriptions, statistic/stats, calendar,
  avatar, image, empty and related display families;
- T6 surfaces/cards/actions: buttons, badges, cards, premium/surface roles,
  command/action and remaining universal live channels.

Each cohort moves existing values through universal semantic derivation, deletes
its extension declarations, signs roster/value/effective hashes and ratchets the
source provenance ceiling. Audit is per cohort, never per token.

### T7 — Forbidden/dead sweep

- delete dead event/ticket channels or map live intent to universal status/badge
  roles; never retain or relocate their names;
- rename dashboard token grammar to universal shell/header/metric/section/
  skeleton roles;
- delete `--rt-*` reads/declarations and use universal roles or existing
  fallbacks;
- delete remaining zero-reader and raw non-custom extension declarations.

### T8 — Severance

- require all three extension files to contain zero declarations;
- remove `extensionCss` from renderer inputs, build scripts and tests;
- delete the three `_source/extension.css` files;
- replace extension provenance with a permanent single-author gate;
- prohibit resurrection of extension files, API, markers or a fourth vertical
  artifact directory.

### T9 — Manifest and point-zero certification

- reconcile `quality-evidence/programs/modern-rescue/manifest` against final
  universal keypaths and channels;
- retain the active denominator: 255 families and 5,100 cells;
- complete dispositions and evidence by family/cohort rather than token;
- run one authorized generated/build/pack/browser tranche;
- close pending receipts, freeze reproducible baseline and certify point zero.

## Cohort acceptance law

A cohort is accepted only when:

- its complete roster is classified and signed;
- no forbidden or cohort-owned declaration remains in extension CSS;
- the compiler has no slug/product branch and no open token map;
- all three Themes expose the same structural keypaths and deterministic order;
- static/DDB equivalent inputs produce byte-identical CSS and digest;
- both modes preserve the pre-migration effective values unless an explicit
  owner-approved visual change exists;
- causal same-count, wrong-mode, dropped-key, duplicate-output and forbidden-name
  mutants fail;
- tests, typechecks, provenance and diff hygiene pass;
- Fable and Kimi K3 audit the whole cohort, not individual tokens.

## Immediate execution decision

GO `T0 THEME-ISO` with Kimi 2.7. T1–T7 may not define a second compiler, preserve
subset parity, create product-specific Theme fields or treat application readers
as authorities. T2–T6 become parallel only after T0 and the T1 derivation law are
accepted.
