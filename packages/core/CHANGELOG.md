# @rottay/design-system

## 2.19.34

### Patch Changes

- Let code-owned presentation profiles govern collection-workspace density
  through `--ds-collection-workspace-density-scale`, while preserving each
  adaptive preset as the fallback and avoiding tenant branches or cascade
  overrides.

## 2.19.33

### Patch Changes

- Complete the adaptive card-grid posture contract with bounded, cascading
  `gridColumns` overrides. Collection workspaces now honor tablet and phone
  column counts in cards mode while preserving configured or automatic card
  columns everywhere the posture does not override them.
- Make `AppShell` geometry presentation-profile aware through four governed CSS
  inputs for expanded/collapsed sidebar widths and header block sizes. Numeric
  props remain the typed fallback and context value; desktop, compact Sheet and
  safe-area calculations now resolve the same declarative recipe.

## 2.19.32

### Patch Changes

- Add exact per-role, BitHire preset, full-corpus, brand-mark and cloud-mark
  entrypoints with supplier-free declarations and measured ESM/CJS retention.
- Govern the four public graphic-asset facades with independent class/provider
  controls, immutable diagnostics, deterministic SSR/hydration and CJS-safe
  mark adapters.
- Certify ParticleField through a DS-owned provider/instance boundary and share
  one continuous runtime budget across Particle and Spatial Canvas/WebGL work.
- Replace decorative QR approximations with a standards encoder; bound QR,
  Watermark and chart raster work; and add real-browser Particle and Spatial
  lifecycle evidence for desktop, mobile, reduced-motion, save-data and context
  failure paths.
- Add code-owned `editorial-ledger` and `ambient-command` presentation profiles
  to the DB-backed tenant-theme contract. Tenants may select an allowed recipe,
  while layout code, raw CSS, icon glyphs and motion recipes remain governed by
  the vertical; SSR now exposes the resolved profile as a root attribute.

## 2.19.31

### Patch Changes

- Certify the explanatory feature-pictogram asset facade, wiring its governed
  skin entrypoint, catalog and provenance so the pictogram corpus renders from
  a single first-party source.
- Expose the governed semantic corpus through a generated facade map, retiring
  the inline Phosphor SSR adapter and slimming the semantic-icon registry and
  component so roles resolve from provenance-backed generated output.

## 2.19.30

### Patch Changes

- Make the adaptive contracts truthful by moving responsive presentation into
  governed skins for the chat, kanban, scheduler, header and visualization
  surfaces, reconciling the chart families' responsive props and adding a
  fail-closed adaptive-contract census so declared adaptive behavior cannot
  drift from what renders.

## 2.19.29

### Patch Changes

- Enforce the declarative owner-boundary contract so barrels stop sharing a
  level with authored production peers: give the `Collapse` layout primitive its
  own folder owner, drain the collection-workspace kit barrel and guard the
  result with a fail-closed owner-boundaries test.
- Make surface pages resolve presentation access through the consuming app
  instead of reaching across the boundary, backed by a surface-capability
  census and a presentation-boundary test that record per-app capabilities for
  BitHire, Evnto and Platform.
- Certify the code-owned Evnto tenant theme source, consolidating its
  experience baseline, product profile, vertical preset and brand theme into a
  single first-party source with expanded brand- and tenant-theme compiler
  coverage.

## 2.19.28

### Patch Changes

- Reorganize the authored source into the declarative
  `foundation / infrastructure / graphics / ui / tooling` architecture, with
  package entrypoints isolated as boundary support and UI ownership flowing
  `primitives → patterns → structures → surfaces`.
- Preserve the public package contract while moving the 18 chart families,
  chart engine, motion/effects runtime, primitives, patterns and structures into
  canonical folder/index owners; add fail-closed structural, path and paint
  gates so the hierarchy cannot silently flatten again.
- Reconcile generated skins, vertical artifacts, semantic assets and canonical
  documentation with the new physical tree while preserving DB-backed compiled
  tenant themes as the production white-label authority.
- Isolate the lightweight skin-pack application seam from brand-theme
  compilation and narrow Modal's responsive dependency, restoring all nine
  flagship component bundles to their existing gzip budgets without widening
  any ceiling.

## 2.19.27

### Patch Changes

- Expand the supplier-free semantic corpus to v3 with seven authentication,
  visibility, inbox, and live-status roles, for a fixed total of 50 names.
- Add Google to the separate `BrandMark` corpus with pinned theSVG provenance
  and deterministic color, mono, light, dark, and wordmark fallbacks.
- Preserve exact SSR rendering, accessible decorative/named behavior, RTL,
  forced-colors, and supplier-free public types across both asset facades.

## 2.19.26

### Patch Changes

- Expand the supplier-free semantic icon corpus from 40 to 43 roles with
  `navigation.route`, `bithire.job`, and `bithire.offer`, backed by pinned
  Phosphor SSR glyphs and exact provenance coverage.
- Keep apps on semantic product meaning rather than supplier component names,
  enabling the first BitHire Global Search adoption without local spinner
  keyframes or direct icon-supplier coupling.

## 2.19.25

### Patch Changes

- Add an explicit `compiled-artifact` visual-authority mode for DB-backed
  tenants. It preserves tenant, locale, theme, motion and feature contexts while
  disabling provider-owned CSS loading, fallbacks, inline variables and
  generated chrome, so the exact SSR artifact remains the sole visual source.
- Clean up only provider-owned legacy theme emitters when authority changes and
  preserve the externally mounted immutable artifact across hydration.

## 2.19.24

### Patch Changes

- Make published tenant data the sole runtime authority for customer themes:
  remove The Management Miami from the automatic registry and generic CSS,
  while retaining its checked-in theme only as an explicit migration and
  visual-regression fixture.
- Preserve customer identity during async branding resolution and fetch the
  published theme for every customer session, including superadmins, without
  ever falling through to another tenant's styling. Host-resolved identity now
  wins over stale session data, and late responses are discarded after a
  mounted consumer switches tenant.
- Export `isBundledTenant` from the public tenant barrel so apps can distinguish
  code-owned vertical baselines from DB-owned customer tenants.
- Key both public async tenant-resolution paths by the resolved slug, discard
  late responses after context switches, reject mismatched payload identities
  and use an uncached neutral shell instead of aliasing unresolved customers to
  Rottay.

## 2.19.23

### Patch Changes

- Regenerate the published supplier contract so the root and server entries
  declare every TenantTheme compiler v2 export consumed by certified apps.

## 2.19.22

### Patch Changes

- Upgrade TenantTheme compilation to `tenant-theme-compiler@2`, deriving
  deterministic, surface-aware OKLCH ramps for all seven final color roles.
- Publish the code-owned BitHire vertical envelope through the server-safe
  registry so apps preview and publish against one fail-closed policy.
- Expose ten color-only chart-category dials without allowing tenant data to
  alter chart renderers or data semantics.
- Reject duplicate tenant chart colors and any category color below 3:1
  non-text contrast against the emitted chart surfaces, including both
  deterministic surfaces when the tenant selects automatic color mode.
- Expand the bounded Advanced artifact budget to 512 variables plus an 88 KiB
  canonical payload ceiling, and allow only code-owned font-pack references in
  tenant font-family lists.

## 2.19.21

### Patch Changes

- Add the closed, server-safe `TenantThemeConfig` v1 document/config contract,
  deterministic compiler, SSR root attributes and strict vertical-envelope validation.
- Project first-party BitHire, Evnto and Platform artifacts onto both their legacy
  tenant roots and isolated `data-ds-root` vertical roots without cross-vertical imports.
- Emit DB tenant overlays unlayered on the exact tenant + vertical root so validated
  runtime themes deterministically override their static vertical baseline.

## 2.19.20

### Patch Changes

- Add supplier-neutral `spatial/spec` policy contracts and a focused `spatial` lifecycle host with
  fail-closed WebGL2 admission, one-context leasing, app-owned semantic fallbacks, bounded quality,
  visibility suspension, context-loss recovery and stale-callback cleanup.
- Certify Spatial SSR/reduced/device behavior, hostile loaders and Canvas registration, package
  isolation, real export inventories, ESM/CJS/declaration closures and measured raw/gzip budgets.
- Harden accessible chart activation, touch cancellation, persistent edge-aware tooltips, RTL
  placement, dense target selection, forced-colors affordances and SSR-safe identifiers.
- Upgrade `AppShell` to canonical phone/tablet/desktop postures, accessible compact navigation,
  `100dvh` and safe-area geometry, 44 px controls and a single posture-aware bottom-inset contract.

## 2.19.19

### Patch Changes

- Add server-safe `charts/spec` contracts with a closed vertical grammar and bounded app-authored
  insight provenance, without tenant identity, hostname branching, browser APIs or chart suppliers.
- Resolve chart personality through the existing provider and DB-owned tenant overlay, keeping
  BitHire and The Management Miami visually distinct while preserving semantic status meaning.
- Add accessible Bar, Line and HeatMap exploration with roving focus, touch/pen cancellation,
  assistive-technology clicks, persistent edge-aware tooltips and forced-colors differentiation.
- Add React-owned target, band, event and direct-label insights plus a focused `charts/access`
  boundary for bounded summaries, paged tables and formula-safe full-dataset CSV export.
- Certify SSR/hydration, hostile input, WCAG non-text contrast, stable collision-safe SVG IDs,
  supplier boundaries and measured isolated/deduplicated renderer budgets.

## 2.19.18

### Patch Changes

- Add the supplier-neutral `effects` entry with a frozen, versioned catalog of eleven canonical
  capabilities, fail-closed admission and canonical-ID-only resolution.
- Record target tier separately from observed runtime facts; keep every lightweight effect as a
  candidate and `ParticleField` quarantined until its final route/adoption authority certifies.
- Pin reference-only research revisions and exact license hashes, cross-check public provenance
  against archived evidence and refuse certification without an authorized-source ledger.
- Harden `ParticleField` with lazy policy/viewport admission, bounded DPR/count/pixels, one global
  RAF lease, deterministic simulation, context recovery and exact resource cleanup.
- Share provider-scoped CSS variable resolution across charts and Canvas, including nested
  fallbacks, cycle rejection, tenant-root isolation and live theme mutation.
- Certify focused accessibility, SSR/hydration, hostile-input and lifecycle behavior plus packed
  ESM/CJS/TypeScript purity; ratchet entries to 800 bytes raw and the all-export fixture to
  5,500 bytes gzip.

## 2.19.17

### Patch Changes

- Add the focused `motion` entry with three vertical-owned motion identities, a bounded DB-safe
  tenant dial and twelve supplier-neutral semantic recipes.
- Resolve one runtime policy across reduced-motion, coarse pointer, constrained network/power and
  document visibility; share browser listeners and clean them after the last consumer.
- Keep active product-state motion distinct from tenant-owned ambient decoration, cap finite moments,
  displacement, stagger and concurrent-loop intent, and expose stable final states when motion is unsafe.
- Derive profile and tenant dial inside `DesignSystemProvider`, map the legacy open-ended brand shape
  for one compatibility minor, and make duration, stagger, parallax and magnetic bounds effective.
- Certify hostile input, SSR/hydration, live preference changes, vertical/tenant invariance and the
  packed ESM/CJS/TypeScript subpath through supplier-honesty and measured bundle gates.

## 2.19.16

### Patch Changes

- Add the focused `charts/renderers` entry with React-owned Bar, Line and HeatMap SVG renderers;
  D3 remains limited to immutable scales, paths, UTC time and color interpolation.
- Recompute geometry from one container observer so responsive charts preserve readable typography,
  while fixed mode retains intrinsic dimensions and creates no observer.
- Harden negative, constant, invalid and duplicate-domain behavior; preserve semantic SVG across
  reconciliation and SSR/hydration; isolate provider-root HeatMap palettes.
- Certify the built ESM/CJS facade, named-export and geometry-builder tree-shaking, public CSS payloads,
  engine paint ratchets and offline tarball TypeScript/runtime consumption with measured budgets.

## 2.19.15

### Patch Changes

- Add the focused `charts` entry with a renderer-neutral `ChartFrame` and JSON-serializable
  phone/tablet/desktop projection contract; phone policies cannot select a full chart.
- Render loading, empty and error feedback without mounting stale marks, and expose shared question,
  toolbar, legend, insight and provenance anatomy through provider-scoped tokens.
- Keep the new boundary supplier-free by separating responsive motion preference from the Motion
  renderer while preserving provider overrides and public compatibility.
- Extend supplier honesty, bundle budgets and the offline packed TypeScript/runtime fixture to certify
  the new ESM/CJS subpath before application adoption.

## 2.19.14

### Patch Changes

- Repair the `marks` declaration entry so TypeScript consumers resolve the public facade instead of
  cycling between the generated entry files.
- Extend packed-artifact certification with an isolated TypeScript consumer, keeping runtime and type
  export conditions under the same offline tarball gate.

## 2.19.13

### Patch Changes

- Add supplier-independent `BrandMark` and `CloudServiceMark` facades under the focused `marks`
  entrypoint, backed by a fixed seven-brand and four-AWS-service corpus from pinned theSVG packages.
- Resolve unsupported brand variants deterministically, choose AWS optical assets by rendered size,
  and fail closed when runtime names or accessible/decorative intent are invalid.
- Record per-asset source, version, license and trademark provenance; preserve faithful color in forced
  colors; and keep the mark renderer unreachable from the package root through supplier-honesty gates.

## 2.19.12

### Patch Changes

- Add a supplier-independent semantic `Icon` facade with a pinned 40-concept Phosphor SSR corpus,
  explicit accessible/decorative intent, logical RTL mirroring, semantic tones and reduced-motion output.
- Keep the Lucide-shaped catalog as a compatibility surface while fixing its SVG title/name contract,
  and isolate the new supplier behind the focused icon entry so the package root cannot load it.
- Embed the pinned semantic glyph corpus inside that focused entry so CommonJS consumers are not
  exposed to Phosphor's invalid `type: module` + `index.cjs.js` conditional export.
- Extend dependency honesty and provenance to account for both the functional supplier and legacy
  compatibility supplier, including a root non-reachability gate for Phosphor.
- Preserve authored first-party `BrandTheme` baselines on first render and merge DB/session branding
  overlays without allowing bounded tenant payloads to replace the registered visual grammar.

## 2.19.11

### Patch Changes

- Adapt FormBuilder grids consistently across classic, modern and rustic: phone layouts project to
  one column, tablet grids cap at two tracks, and desktop or explicit opt-out preserves caller values.
- Add a backward-compatible responsive viewport authority for virtual-keyboard occlusion and first
  client resolution, and let fixed ActionDock instances consume app-shell, safe-area and keyboard insets.
- Add opt-in mobile FormSurface and WizardSurface action docks, compact localized wizard progress,
  localized dirty-work protection, and complete disabled submission/draft semantics.
- Preserve legacy custom responsive contexts while exposing a strongly normalized hook return for new
  consumers, including SSR-neutral posture until the real viewport snapshot resolves.

## 2.19.10

### Patch Changes

- Materialize every named collection filter posture: inline remains canonical and direct, while
  sheet and anchored dropdown share one transactional draft with accessible dismissal and focus.
- Materialize preview panes as resizable inline rails, sheets, accessible accordions, native route
  activation, or truly hidden content while preserving canonical selection and action continuity.
- Add compact preview render context, stale-item cleanup, viewport-safe dropdown placement, nested
  control portal handling, and keyboard-safe card activation without nested interactive semantics.

## 2.19.9

### Patch Changes

- Project compact collection headers from the shared responsive authority and preserve phone action
  continuity: the primary action renders once in a sticky ActionDock, secondary quick actions remain
  reachable through an accessible More sheet, stable keys de-duplicate safely, and desktop stays intact.
- Add fixed/sticky ActionDock modes with tokenized stacking, spacing, shadows and safe areas; expose
  root DOM/a11y hooks and add identity-only `CollectionHeader` projection without component-local
  viewport subscriptions.

## 2.19.8

### Patch Changes

- Harden AdaptiveOverlay and Sheet across classic, modern and rustic engines with a controlled close
  lifecycle, rich titles, real-dialog ARIA, fixed footer anatomy, focus restoration, safe-area/dynamic
  viewport support and stack-aware Sheet scroll/Escape coordination.
- Turn `adaptive.filters: 'sheet'` into a transactional mobile filter workspace: edits remain draft-only
  until Apply, Cancel and dismiss discard them, Clear resets the draft, and desktop filters remain inline.

## 2.19.7

### Patch Changes

- Make the modern feedback modal adopt a full-viewport phone posture from the shared responsive
  authority while preserving explicit fullscreen behavior and tenant-owned styling.
- Treat StatsGrid `columns` as a desktop ceiling: one track on phone, up to two on tablet, and the
  requested count on desktop across all engines, with overflow-safe tracks and explicit style escape hatches.

## 2.19.6

### Patch Changes

- Prevent custom card interaction handlers from bubbling into the collection wrapper and invoking
  row-open behavior twice; selection and open handlers can now consume the originating event.

## 2.19.5

### Patch Changes

- Preserve selection, open and row-action behavior when data tables and collection workspaces
  project app-authored cards on mobile through an additive renderer context.
- Keep mobile data-table roots full-width and retain caller class, style and density contracts when
  the responsive renderer switches away from desktop rows.

## 2.19.4

### Patch Changes

- Ship the refreshed supplier contract for the surface-capability exports and keep app manifests
  honest about every runtime supplier they render through the design system.
- Harden the packaged supplier scanner so ordinary computed data access remains valid while
  explicit and definitely-callable loader transport stays fail-closed.
- Certify the published tarball through a clean, fully offline consumer with isolated runtime
  packages, resolved exports, ESM/CJS execution, and a supplier-free non-consuming bundle.
- Close the chart-correctness floor across all 17 families: provider-scoped palettes, deterministic
  edge semantics, React-owned accessibility, an exact public capability contract, explicit compact
  mode, and tenant-driven tooltip personalities.
- Add the SSR-safe `MotionProvider` authority, explicit `durationMs`/`delayMs` APIs with one-release
  legacy compatibility, final-first reduced-motion behavior, cancelable counters, and motion
  governance for global keyframes and direct choreography.
- Adopt the current Motion for React package entry (`motion/react`) at one pinned fleet version while
  keeping the underlying runtime external and tree-shakeable for consuming applications.

## 2.19.3

### Patch Changes

- Add a data-independent surface capability registry and responsive anatomy renderer so load
  failures preserve registered fields, columns, tabs, and individual actions without invoking
  data callbacks.
- Extend `CollectionWorkspaceSurface` with `capabilityRegistry` and preserve full registered
  anatomy in `DetailSurface` error states under app-resolved superadmin access.

## 2.19.2

### Patch Changes

- Extend the app-resolved `access` contract to `CollectionWorkspaceSurface`, including deterministic
  column filtering for resolved access and the superadmin `all` short-circuit.
- Preserve registered column and row-action anatomy when collection data fails, using a responsive
  error layout that never invokes row callbacks without data.

## 2.19.1

### Patch Changes

- Add the app-resolved `access: all | resolved` presentation contract to all 33 surface configs. `all`
  is the superadmin path and bypasses every DS visibility, allow/deny, cascade, row and callback filter
  before it is evaluated; legacy `permissions` remains available for one compatibility release.
- Quarantine live particle-field routes behind the explicit craft opt-in and publish the focused optional
  supplier entrypoints plus ES2020-safe runtime helpers prepared by the Wave-0 dependency work.

## 2.19.0

### Minor Changes

- 4209c59: Complete Stage-1 skin adoption by extending the input work released in 2.18.0 across feedback,
  overlay, navigation, display, layout, patterns, structures, surfaces, tenant previews and
  visualization. Migratable static and finite-state paint now lives in scope-anchored, unlayered skins
  with stable `data-part`/state hooks wherever the rendered owner can expose them. Composition-blocked
  paint plus caller-, datum-, tenant-, user-, document-derived and runtime-SVG paint remains at exact
  executable floors and is explicitly handed to Stage 2. This is a byte-exact ownership release, not
  an intentional visual redesign; every public tenant/vertical CSS entrypoint is regenerated.

## 2.18.0

### Minor Changes

- 52d1804d: Complete WO-SKIN-02: all 25 input components now paint from 52
  unlayered skins on the public `data-part` contract. This release also makes
  every Stack engine forward the HTML attributes already promised by
  `StackProps`.

## 2.17.0

### Minor Changes

- 0c372387: Complete WO-ARC-09: six workspace-tier components now paint from
  unlayered skins on the public `data-part` contract. Add `subtle` and `inherit`
  to `TextColor`, and add `data-part` to `BaseComponentProps`.

## 2.16.6

### Patch Changes

- 2fe56546: Add the public `@rottay/design-system/commercial` entrypoint and its
  monochrome component and CSS kit.

## 2.16.5

### Patch Changes

- feat(inputs): `Input` gains a bare `type="file"` passthrough — renders a chrome-free `<input type="file">` that forwards its ref (for programmatic `.click()`) and its native change event (so callers read `event.target.files`), plus `accept` / `multiple` props. Lets apps use a DS primitive for native file pickers instead of raw `<input type="file">`. (app-bithire WO-CNF-01 / RT-ERR-02.)

## 2.16.4

### Patch Changes

- fix(Box): void HTML elements (`input`, `img`, `br`, `hr`, `area`, `base`, `col`, `embed`, `source`, `track`, `wbr`) rendered via `Box as="…"` no longer crash under the `modern` engine. `ModernBox` passed `React.Children.toArray(undefined)` (=== `[]`) as the `createElement` children argument, and React-DOM rejects a children argument on a void element ("`<input>` is a void element tag and must neither have children…"), so every void `Box` was replaced by the `EngineErrorBoundary`. All three engines (`modern`/`classic`/`rustic`) now gate on `isVoidElement(as)` and create void elements with no children argument. This unbroke the public apply page whose hidden job-identifier input was dropped. (app-bithire WO-CNF-01 / RT-ERR-01.)
- feat(inputs): `Input` gains a bare `type="hidden"` passthrough — renders a chrome-free, form-participating `<input type="hidden">` for server-action forms (FormData) without any wrapper, focus ring, or placeholder styling.

## 2.9.0

### Minor Changes

- a65322b: feat(surfaces): CollectionWorkspace gains `surfaceMode` (`"page" | "embed"`) and a `chrome` config to control which workspace regions (header, command, context, stats, insights, activeFilters, ...) render per instance. Embedded workspaces (nested inside another surface) default to minimal chrome; page workspaces render the full collection chrome. Enables consuming apps to embed collection workspaces inside record-detail sections without the full page chrome.

## 2.8.14

### Patch Changes

- Fix modern data table body cells so visible row content uses configured column widths instead of collapsing to zero width.
