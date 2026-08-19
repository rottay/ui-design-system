---
"@rottay/design-system": major
---

## 3.0.0 — the canonical-tree release

This major consolidates the design system onto its target architecture
(`docs/ARCHITECTURE.md`): one capability, one owner, one public name. It
accumulates every public-API removal of the remediation programme; it is
finalized at publish time. Consumers must run the codemods in
`packages/core/scripts/codemods/` before upgrading.

### Breaking changes

**Subpaths removed**

- `./commercial` and `./commercial.css` — "commercial" is a marketing
  adjective, not an architectural role; the kit's components are consumed from
  the root barrel under their reclassified names. (53 importer files in
  app-platform migrate in its vertical phase.)
- `./styles/platform` and the `dist/platform.css` artifact — the `platform`
  identity is extirpated; `styles/rottay` is byte-identical and is the bundle
  to import.
- The 75 granular per-tier subpaths (`./primitives/*`, `./patterns/*`,
  `./structures/*`, `./surfaces/*`, `./contracts/*`, `./runtime/*`) — the root
  barrel with an explicit API list is the public way.

**Components removed (one capability, one owner)**

- `Toggle` → use `Switch`. `Stepper` → use `Steps`. `HoverCard` → use
  `Popover`/`Tooltip`. `Message` → use `Toast`. `Callout` → use `Alert`.
  `Space` → use `Stack`. `ConfirmDialog` → use `AlertDialog`.
  `FloatButton.BackTop` → use `BackTop`.
- `approval-inbox` (PatternApprovalInbox) → succeeded by the
  `DecisionInboxSurface`.
- `StatsHeader` → use `PatternStatsGrid`. `ListSurface` → use
  `CollectionWorkspaceSurface`. `RecordWorkbenchSurface` → use `DetailSurface`.
- `MapView` (integration placeholder without a map provider).
- The patterns side of the collection-chrome duplicates (`TableToolbar`,
  `SavedViewsMenu`, `FieldFiltersPanel`, `ColumnSettings`) — canonical owners
  named in `docs/ARCHITECTURE.md` §3.

**Renames**

- Typography's `Link` becomes `TextLink`; the navigation primitive owns the
  public `Link` name (two-phase migration: `TextLink` is available before the
  swap).
- Pictograms `candidate-evidence` and `event-moment` become domain-agnostic
  names.
- The ~14 `--ds-commercial-*` custom properties are renamed to their
  canonical `--ds-color-*` channels.

**Compatibility notes**

- The legacy hand-drawn icon set (`graphics/icons/presentation/legacy/`) is
  removed; the governed 282-role semantic corpus covers every case
  (`security-alert`, `status-loading`, …).
- Apps pinned to `2.19.x` keep working; nothing in this release changes the
  2.x line.
