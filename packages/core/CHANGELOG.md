# @rottay/design-system

## [Unreleased]

### Minor Changes

- Add `FileManagerPathSegment` (`{ id, name }`) and let
  `FileManagerProps.currentPath` accept segments as well as strings, mixed in
  one root-first trail. An ancestor segment crumb on the Modern engine hands its
  supplied `id` to `onNavigate`, never its name and never an id looked up in
  `folders` (ancestors are not direct children, so a lookup could not find
  them). Crumbs stay keyed by position, so repeated names or ids keep every
  ancestor interactive and one crumb current. Root keeps its separate
  `onNavigate(null)` contract.
- Refuse, in development and production, every path the selected
  implementation cannot honor, by name under `PatternFileManager`: a segment
  path on the frozen Classic or Rustic engine (inside the component's error
  boundary), a segment path on the custom engine (before the component pack
  is resolved; no pack can prove segment support), and on Modern a segment
  whose `id` is `''` or an element that is neither a string nor a segment.
  An empty id is never read as Root and never replaced by the name. Hosts
  recover by passing valid segments or a string-only path, or by rendering on
  Modern. String-only paths keep every route they had, custom packs included.
- Compatibility: code that reads `FileManagerProps['currentPath']` as
  `string[]`, or one of its elements as `string`, no longer compiles and must
  handle segments; code that passes `string[]` is unaffected. The exact
  release version remains a release-owner decision.

### Deprecated

- String elements of `FileManagerProps.currentPath`. They keep their previous
  behaviour for one minor release: the string is both the crumb label and the
  value an ancestor crumb hands to `onNavigate`. Known limitation: when the
  string is a folder name, `onNavigate` receives that name, not a folder id,
  and the pattern cannot resolve it. This flow is not certified. Migrate to
  `FileManagerPathSegment`; removal requires a future major release and a
  release-owner decision. `FileBrowserSurface` still forwards
  `behavior.currentPath` as `string[]` and inherits this limitation.

### Patch Changes

- Let the Modern Link hover ink follow tenant state emphasis. A new `link`
  family deriver produces `--ds-link-hover-mix`, the share of
  `--ds-color-neutral-900` in the hover ink, from the hover state delta:
  subtle 28%, medium 30%, strong 34%. The skin mixes each variant's own tone
  at that share on the Link element, so medium keeps the previous 70/30 ink and
  every variant keeps its hue. An authored `--ds-link-hover-color` still wins,
  and the skin's 30% fallback paints when the share or the states root is
  absent. Rest, visited, pressed, disabled and focus inks and the hover
  underline are unchanged. No public API or dependency change. Source, focal,
  generated-artifact, AA arithmetic and computed-style checks cover the
  correction; public-package acceptance remains pending.
- Let the Modern Tabs icon well on a selected or hovered tab follow tenant
  state emphasis through the selected shift. It still computes the previous
  10% primary tint under medium emphasis (Rottay, Evnto and unauthored
  themes), moves to 6% under subtle and 18% under strong (BitHire), and keeps
  the skin's 10% fallback when the states root is absent. An authored
  `chrome.tabs.iconBgActive` still wins. The resting icon well, the active
  keyline and every other Tabs channel are unchanged. No public API or
  dependency change. Source, focal, generated-artifact and computed-style
  checks cover the correction; public-package acceptance remains pending.
- Let Modern TimePicker and TreeSelect option hover backgrounds follow the
  control material and tenant emphasis, retaining the palette hover as the
  fallback and preserving every other channel. No public API or dependency
  change.
- Size the Modern PageShell eyebrow from the label role through its own
  `--ds-page-shell-eyebrow-size` channel, so it follows `typography.scale` and
  an authored label size like the eyebrow weight already does. The eyebrow
  rests at the label role size instead of the fixed 10px it painted before,
  which is an intentional visible change. The shared
  `--ds-page-header-eyebrow-size` stays unproduced and PageShell no longer
  reads it; CollectionHeader's overline is unchanged and still reads that name
  through to `var(--ds-font-size-xs, 12px)`. Eyebrow tracking, transform and
  title measure are unchanged. No public API or dependency
  change. Source and focal checks cover the correction; generated artifacts,
  browser/computed-style and public-package acceptance remain pending.
- Refuse a v2/v3 tenant document over the v1 schema's payload ceilings (depth
  10, 512 fields, 65,536 canonical bytes) with `invalid_value` at `$.document`
  and the v1 messages, after the identity stations and before admission walks
  it. The v1 door's measurement and limits are shared, not copied or changed.
  The byte ceiling applies to JSON documents only: an in-memory document with
  an `undefined` optional member keeps its previous outcome with depth and
  fields still measured, and a cyclic in-memory document now receives the typed
  lowering refusal at `$.document`. No public API or dependency change. Source
  and focal checks cover the correction; browser and public-package acceptance
  remain pending.
- Keep DataTable mobile cards inert when no `onRowClick` is supplied: no button
  role, tab stop, clickable state or consumed Enter/Space. With `onRowClick`,
  click, Enter and Space still open the right row, and selection and row
  actions do not open it. Rustic Card keyboard bubbling from nested controls
  is not changed by this correction. No public API or dependency change. Source
  and focal checks cover the correction; browser/assistive-technology and
  public-package acceptance remain pending.
- Follow the section-title role weight for the List header, keeping its
  semibold fallback, in the authored List tokens, the root-alias table and the
  Rottay, BitHire and Evnto served artifacts. List meta stays on the medium
  weight, and no vertical's outright alias exclusions drop the header, so scoped
  tenant emission restates it. The served artifacts, root-alias table, cascade
  edges/producers/fanout inventories and hooks manifest are regenerated against
  current source. That lands the Alert, Notifier, Toolbar, Descriptions,
  Stepper, GuidedDraftForm, ShortcutsOverlay and Table weights, the Tabs,
  Breadcrumb, Cascader and DatePicker material grounds and the Avatar solid
  fills recorded below in the served CSS, with no new behaviour beyond those
  entries. No public API or dependency change. The theme-graph, resolved
  values, slot/membership/purity inventories, base-environment tokens and
  generated CSS mirrors still need a built-dist window; browser/computed-style
  and public-package acceptance remain pending.
- Follow the section-title role weight for Modern ShortcutsOverlay titles and
  the label role weight for the Table pagination current page, each keeping its
  semibold fallback; ShortcutsOverlay category weight, its Modal chamber and the
  other channels of both families are unchanged. This supersedes the earlier
  note that Table pagination weight was preserved; at the deriver level the
  BitHire current page now resolves to 700. Refuse style decision names the
  style partition does not own, such as inherited `constructor`, `toString` or
  `__proto__`, with the existing unclassified-row error while all 29 rows keep
  their classification. Refuse a malformed or non-string v2/v3 tenant document
  slug at `$.slug` with `invalid_value` before admission under the unchanged
  v1/mount slug grammar; `tenant--one` stays valid and reserved identities keep
  their own refusal. No public API or dependency change. Source and focal checks
  cover these corrections; generated artifacts, integration, browser/computed-
  style and public-package acceptance remain pending.
- Follow semantic role weights for Modern Result titles and PageShell eyebrow/
  terminal-crumb labels, preserving Result's bold HTTP codes, ordinary crumb
  weights and existing semibold fallbacks. Let GuidedDraftForm inherit the
  section-title family weight by default; an explicit compiled heading bias
  takes precedence over an authored product-profile bias and retains the
  lighter/normal/heavier family-root values 500/600/800. Preserve inherited
  family overrides, caller styles and the public API. Source and focal checks
  cover these corrections; integration, browser/computed-style and public-package
  acceptance remain pending.
- Correct Modern Avatar light-secondary solid fills to 64% tenant seed / 36%
  neutral-900 so Rottay/Evnto white initials reach at least 4.5:1 contrast.
  This resolves the light-secondary residual recorded below; preserve accepted
  dark recipes and caller overrides without changing the public API.
  Source and focal checks cover first-party palettes; integrated browser and
  public-package proof remain pending.
- Route Modern Tabs line hover/active and Breadcrumb hover/current backgrounds
  through their existing material state channels and tenant emphasis, retaining
  authored family overrides and the original absent-material fallbacks.
- Keep Modern Avatar secondary, success, warning and error solid fills dark
  against white initials in dark mode, preserving tenant seeds, caller overrides
  and light-mode recipes. The existing light-secondary contrast residual
  (about 3.195:1 for Rottay/Evnto) remains open for a separate correction.
- Make TagInput sm/md/lg heights follow the existing Input ramp, preserving
  authored TagInput precedence and applying density/control-height once.
  Source and focal regression evidence supports these three corrections;
  integrated browser/computed-style and public-package proof remain pending.
- Follow the section-title role weight for Modern Stepper items and current-process
  titles while preserving semibold fallbacks and ordinary medium labels.
- Follow the section-title role weight for Modern Descriptions titles while
  preserving the semibold fallback and every other family channel.
- Neutralize spreadsheet-formula prefixes after optional whitespace in shared
  CSV header and data cells before RFC 4180 quoting. Ordinary values and custom
  cell-escape policies retain their existing behavior.
- Keep Modern FormBuilder titled sections synchronized with validation errors
  and later content growth by observing the inner fields container. Collapsed
  sections remain at zero height and untitled sections stay uncapped; without
  ResizeObserver, measurement follows FormBuilder commits and window resize.
- Wire the public `useInlineEditing` props spread to PatternDataTable's existing
  click, double-click and F2 triggers using the configured row key, preserving
  commit, cancel, batch and save-error behavior.
- Bind Modern FormField labels and validation messages to Slider, OTPInput,
  Rate and Upload controls. Preserve caller naming, range thumb names and OTP
  ID prefixes; give generated field IDs instance scope and keep Upload trigger
  descriptions without nesting custom buttons inside interactive picture triggers.
  Preserve named keyboard triggers for decorative Upload content.
- Follow the label role weight for Notifier titles and the section-title role
  weight for Toolbar titles, preserving urgent notification weights, title
  metrics and local density behavior.

- Let Modern DatePicker navigation and day-cell hover backgrounds follow the
  control material and tenant emphasis, with palette hover as the fallback.
- Let Modern Cascader option hover follow material state emphasis, retaining
  the palette hover color as the fallback when material hover is absent.
- Follow the section-title role weight for Modern Table titles, with semibold
  as the fallback; preserve pagination weight and the other Table channels.
- Bind public `Grid.Item` to the adaptive track limit and reset that limit at
  each public Grid root. Automatic endpoints clamp after measurement while
  anchored placement and frozen nested engines retain their own behavior.
- Follow the section-title weight posture for non-urgent Alert titles while
  preserving urgent bold and label metrics.
- Keep Modern Card content visible in shrink-to-fit, Flex and intrinsic
  compositions without imposing full width on every Card root.
- Correct Modern Grid auto-fit measurement, inherited recipe invalidation and
  span clamping while preserving automatic endpoints and explicit placement.
- Make Modern FilterPanel select options neutral by default. Remove label/value
  inference of business tone and icons while preserving explicit consumer
  metadata.

- Correct ACT-07/DSA-TC-003 flat and elevated shadows on dark ground with
  top hairlines and ambient depth selected from the effective background.
  Preserve literal light ladders, soft inheritance, none roles, authored levels
  and static/serialized-DB parity without changing the public API or controls.
  Source checks do not certify browser rendering, generated snapshots or package
  acceptance.

- Name the Input.Search action button from visible `searchButtonText`, and
  the Modern BackTop from visible text children, so the accessible name
  contains the visible label (WCAG 2.5.3 label in name). Input.Search is the
  shared compound, so this applies under every engine. Content with no letter
  or digit (icons, arrows, other symbols), and text that is `aria-hidden` or
  inside a `hidden` element, keeps the localized "Search" / "Back to top"
  name, and both defaults are unchanged. Text that a custom component renders
  without receiving it as `children` is not detected and keeps the localized
  name. Conversely, text passed as `children` to a custom component that does
  not render it leaves the button with an empty accessible name; render the
  text instead. onSearch, Enter and composition, loading, disabled,
  showSearchButton, and the BackTop scroll journey, reduced motion, focus
  return and late target are unchanged. Classic and Rustic BackTop are frozen
  and not changed. Their naming stays open. No public API or dependency
  change. Source, focal checks and Chromium accessible-name checks cover the
  correction, including default and icon-only names, the shipped BackTop
  preview and the lazy-child window. Assistive-technology and public-package
  acceptance remain pending. In Chromium, a lazily loaded child has an empty
  accessible name until its engine resolves, then its visible text names the
  button; this residual is disclosed and is not claimed as assistive-technology
  tested.

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
