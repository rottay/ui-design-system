---
"@rottay/design-system": major
---

## 3.0.0 — the canonical-tree release

This major consolidates the design system onto its target architecture
(`docs/architecture/index.md`): one capability, one owner, one public name. It
accumulates every public-API removal of the remediation programme; it is
finalized at publish time.

### Upgrading: the codemod kit

The kit ships at `packages/core/scripts/maintain/codemods` and runs as
`pnpm -C packages/core codemods <dir>` (operands resolve from `packages/core`).
It is a dry-run by default: it prints every planned rewrite and every report
and writes nothing. `--write` applies the proven rewrites; `--check` is the
dry-run that exits 1 while any finding remains, for CI. An entry marked
report-only is never written, whatever its class.

A node is edited only when its import resolves to `@rottay/design-system` or
one of its published subpaths. Everything else is reported with its reason: a
consumer wrapper, a spread, a props object, a namespace or dynamic import, a
name reached through a consumer-owned alias, a replacement name the file
already shadows.

The 3.0 map (`release-3-0-map/index.json`) has 607 entries: 155 can rewrite and 452
are report-only. Per class:

- `subpath-removed` (86). 83 re-point: the 75 granular per-tier subpaths and
  `./commercial` to the package root, `./icons/full` and `./icons/corpus` to
  `./icons`, `./icons/bithire` to `./icons/presets/bithire`, `./styles` to
  `./styles.css`, and `./styles/default`, `./styles/platform` and the
  `dist/platform.css` path to `./styles/rottay`. A module door is re-pointed
  only for a named import or re-export whose every name the target door
  publishes or has a successor the map records for that door; a namespace,
  default, side-effect, star or dynamic import is reported. A stylesheet door is re-pointed in a JavaScript or TypeScript
  import; inside a stylesheet it is reported, never rewritten. 3 are
  report-only because no public substitute is named: `./effects`,
  `./spatial/spec`, `./commercial.css`.
- `symbol-removed` (21). Rewritten: the import binding moves to the published
  replacement name and every reference bound to it follows; a name retired on
  a removed door moves to its successor on the target door under its local
  name (`TreeViewConnector as TreeView`). Reported: a cross-door replacement
  reached through a namespace, an `import()` type or a declaration the door
  transform holds back, a name reached through a consumer-owned declaration,
  a shadowed replacement, a binding destructured from a namespace.
- `prop-renamed` (12). 4 rewrite on an element proven to be the design-system
  component: `color` to `swatchColor` on `TooltipValue`, `initial` to
  `defaultCurrent` on `Stepper`, `orientationMargin` to `textPosition` and
  `margin` to `spacing` on `Divider`. Reported there: an element that already
  states the new prop, a spread, a props object, a consumer wrapper. 8 are
  report-only: the un-suffixed motion timing props, whose rename carries a
  seconds-or-milliseconds decision per site.
- `prop-removed` (9). 8 rewrite: `columns` and `minColumnWidth` are deleted
  from `PatternGridView` and `PatternGalleryView` elements, `duration` and
  `delay` from `ScrollReveal`, `dateFullCellRender` and `monthFullCellRender`
  from `Calendar`, when the value has no side effect. Reported there: a value
  with a side effect, a spread, a props object, a consumer wrapper. 1 is
  report-only: `loading` on `ChartScaffold`, which becomes `state="loading"`.
- `union-member-removed` (41). 39 rewrite a string literal on a prop of an
  element proven to be the design-system component: `small` / `middle` /
  `large` to `sm` / `md` / `lg` on `AutoComplete`, `Cascader`, `Collapse`,
  `ColorPicker` and `TreeSelect`; those three and `default` to `md` on
  `Table`, `Form`, `InputNumber`, `TimePicker` and `DatePicker`; `middle` and
  `default` to `md` on `Switch`; `left` / `right` to `start` / `end` on `Box`
  only under `--assume-ltr`. Reported there: a non-literal value, a spread, a
  consumer wrapper. 2 are report-only: `small` and `large` on `Switch`, which
  render a different step on Classic and Rustic once renamed.
- `symbol-removed-no-replacement` (65). Report-only: nothing public replaces
  the export, so every design-system-resolved use is listed with its guidance.
- `member-changed` (35). Report-only: every design-system-resolved use of the
  owning export is listed with what changed.
- `css-class-renamed` (2 entries, 24 class names). Report-only: each exact
  class token is listed with its canonical name.
- `css-custom-property-renamed` (8 entries). Report-only: each exact
  custom-property name is listed with its recorded successor, or as removed.
- `glyph-removed` (328). Report-only: each use of a retired vendor-named glyph
  is listed.

The 328 vendor glyphs, the CSS class renames and the custom-property renames
are report-only: the kit lists every site and edits none of them. A glyph ->
role table is an open obligation; until it exists each glyph use needs a role
chosen by intent, and `label` or `decorative` stays a manual decision either
way. No automatic upgrade is claimed for the applications: the kit performs
the rewrites above and hands the rest to a person.

### Breaking changes

**Subpaths removed**

- `./commercial` and `./commercial.css` — "commercial" is a marketing
  adjective, not an architectural role. The kit's components are published by
  the root barrel: `AsciiDiagram`, `AsciiFrame`, `CropMarks`, `InvertSection`,
  `MonoStat`, `SectionFrame`, `TerminalBlock`, `TextureBackdrop` and
  `Typewriter` are root exports under the same names, with their prop types.
  (The kit's dry-run of 2026-10-03 finds 53 importer files in app-platform.)
  Not everything moved under its old name:
  - `ProductWindow` and `ProductWindowProps` have no root successor; the
    component left the package. The kit reports each use.
  - The root publishes no `TreeView`. The component continues as
    `TreeViewConnector`, with `TreeViewConnectorNode` and
    `TreeViewConnectorProps` carrying the same fields the door's `TreeNode`
    and `TreeViewProps` had. The kit makes this rename in a named import or
    re-export: `TreeView`, `TreeNode` and `TreeViewProps` become
    `TreeViewConnector as TreeView`, `TreeViewConnectorNode as TreeNode` and
    `TreeViewConnectorProps as TreeViewProps` on the package root.
  - The root's `TreeNode` and `TreeViewProps` are the types of
    `PatternTreeView`, a different component with a different shape (`key` is
    required, `data` is an array). The kit never re-points those two names to
    the root homonyms; it moves them to the `TreeViewConnector*` types.
  - `commercialTokens`, `commercialGray`, `COMMERCIAL_GRAY_HEX`,
    `COMMERCIAL_INK_HEX`, `COMMERCIAL_PAPER_HEX` and `CommercialGrayStep` have
    no root successor. Read the custom properties in the table below instead.
  - No stylesheet replaces `./commercial.css`; the kit reports the import.
    The successor properties are declared by the package's own token layer.
- `./styles/platform` and the `dist/platform.css` artifact — the `platform`
  identity is extirpated and the file is no longer built. `./styles/rottay` is
  the bundle to import; before the retirement both subpaths resolved the same
  built file. A consumer that imports the artifact by path
  (`@rottay/design-system/dist/platform.css`) must replace that import with
  `@rottay/design-system/styles/rottay` as well.
- The 75 granular per-tier subpaths (`./primitives/*`, `./patterns/*`,
  `./structures/*`, `./surfaces/*`, `./contracts/*`, `./runtime/*`) — the root
  barrel with an explicit API list is the public way.

**Components: what has landed and what has not**

No component removal named by earlier drafts of this changeset has landed.
Every component below is still a root export; none of them is a 3.0 removal
until a changeset declares it.

Deprecated in source, still published, removal recorded for the 3.0 line in
the deprecation ledger (`packages/core/contracts/package/deprecations`):

- `Switch`, `SwitchProps`, `SwitchSize` — use `Toggle`, `ToggleProps`,
  `ToggleSize`.
- `Steps`, `StepsProps` — use `Stepper`, `StepperProps`.
- `Callout` — use `Alert` (`<Alert message description action />`).
- `PatternApprovalInbox` — succeeded by `DecisionInboxSurface`.

Still published with no deprecation marker; the canonical owner is named so
new code can choose it, and no removal is staged yet:

- `HoverCard` — canonical: `Popover` or `Tooltip`.
- `Space` — canonical: `Stack`.
- `ConfirmDialog` — canonical: `AlertDialog`.
- `FloatButton.BackTop` — canonical: `BackTop`.
- `StatsHeader` — canonical: `PatternStatsGrid`.
- `ListSurface` — canonical: `CollectionWorkspaceSurface`.
- `RecordWorkbenchSurface` — canonical: `DetailSurface`.
- `PatternMapView` — an integration placeholder without a map provider.

`TableToolbar`, `SavedViewsMenu` and `FieldFiltersPanel` are published once
each, from `packages/core/src/components/structures/workspace/`;
`PatternColumnSettings` is published from
`packages/core/src/components/patterns/data/column-settings`. No public name
of that group is removed.

**Renames**

- The `--ds-commercial-*` custom properties are retired: 26 names, each with a
  successor the package declares. The package emits none of the old names.
  The kit reports every read and edits none.

| Retired | Successor | Value today |
| --- | --- | --- |
| `--ds-commercial-bg` | `--ds-surface-bg` | same role |
| `--ds-commercial-fg` | `--ds-surface-fg` | same role |
| `--ds-commercial-ink` | `--ds-color-surface-ink` | derived from the mono ramp (97% ink), not the fixed `#0a0a0c` |
| `--ds-commercial-paper` | `--ds-color-surface-paper` | same role |
| `--ds-commercial-hairline` | `--ds-color-hairline` | same role |
| `--ds-commercial-hairline-strong` | `--ds-color-hairline-strong` | same role |
| `--ds-commercial-font-mono` | `--ds-font-mono` | same role |
| `--ds-commercial-focus-ring-width` | `--ds-focus-ring-width` | same role |
| `--ds-commercial-motion-ease` | `--ds-ease-out` | same role |
| `--ds-commercial-motion-fast` | `--ds-duration-fast` | same role |
| `--ds-commercial-motion-normal` | `--ds-duration-normal` | same declaration (`var(--ds-motion-normal, 200ms)`) |
| `--ds-commercial-motion-slow` | `--ds-duration-slow` | resolves `var(--duration-normal, 0.3s)`, not the former 320ms |
| `--ds-commercial-texture-ink` | `--ds-texture-backdrop-ink` | same role |
| `--ds-commercial-texture-paper` | `--ds-texture-backdrop-paper` | same role |
| `--ds-commercial-texture-opacity` | `--ds-texture-backdrop-opacity` | same role |
| `--ds-commercial-gray-0` | `--ds-color-mono-0` | the tenant neutral ink, not a fixed hex |
| `--ds-commercial-gray-100` | `--ds-color-mono-100` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-200` | `--ds-color-mono-200` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-300` | `--ds-color-mono-300` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-400` | `--ds-color-mono-400` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-500` | `--ds-color-mono-500` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-600` | `--ds-color-mono-600` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-700` | `--ds-color-mono-700` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-800` | `--ds-color-mono-800` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-900` | `--ds-color-mono-900` | a `color-mix` of the ramp ends, not a fixed hex |
| `--ds-commercial-gray-1000` | `--ds-color-mono-1000` | the tenant neutral paper, not a fixed hex |

Two renames earlier drafts announced have not landed and are not part of this
release as it stands:

- Typography's `Link` is still the root `Link`. The navigation primitive is
  published as `NavLink` (`NavLinkProps`, `NavLinkType`).
- The pictograms `candidate-evidence` and `event-moment` keep those names.

**Compatibility notes**

- The legacy hand-drawn icon set (`graphics/icons/presentation/legacy/`) is
  removed; the governed 282-role semantic corpus covers every case
  (`security-alert`, `status-loading`, …). `AlertIcon` is the one hand-drawn
  icon still published, on `./icons`.
- The R0 receipt of the quality-evidence v2 programme referenced the retired
  `quality-evidence:v1` CLI and the retired aliases; the receipt is a
  historical transcript (not re-run) and the v2 drills are the live coverage.
- Apps pinned to `2.19.x` keep working; nothing in this release changes the
  2.x line.
