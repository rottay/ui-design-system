# @rottay/design-system

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
