---
"@rottay/design-system": major
---

WO-RET-06 W-3a (F-84 remainder (a)): density has one type and one name per axis.

- **Rendered density posture**: `DensityPosture` (`compact | comfortable | spacious`, with
  `DENSITY_POSTURES`). The public name and type identity are unchanged; its one declaration
  moves to the token density module, and the root, `./server` and the density runtime
  re-export it.
- **Tenant appearance density**: `DensityMode` on `./server` (the theme decision
  `density.mode`, `compact | normal | spacious`), unchanged. The two compose: the mode
  factor at the root, the local factor below it.

The other names respelled the posture axis and retire into it:

- `SurfaceDensity`, `ActionDockDensity` and `./server`'s `DocumentDensityPosture` were
  value-identical to `DensityPosture`: use `DensityPosture`.
- `normalizeSurfaceDensity` is renamed `normalizeDensityPosture`, with the same signature and
  behaviour (`normal` -> `comfortable`).
- `MarkdownDensity` is removed: `MarkdownViewProps.density` is
  `Exclude<DensityPosture, 'spacious'>` (the same two literals). Spell an annotation as
  `NonNullable<MarkdownViewProps['density']>`.
- `DensityProfile` is removed: `VerticalManifest.density` is `DensityPosture`. `airy` is not
  a density posture (it belongs to the rhythm axis, `spacing.rhythm`); use `spacious`.
  `comfortable` and `compact` are unchanged.
- `Density` (`compact | normal | comfortable`) is removed. It had no reference. Rendered
  density is `DensityPosture`; the tenant decision is `DensityMode` on `./server`.
- `TooltipProps.density`, `PopoverProps.density` and `ActionDockProps.density` are typed
  `DensityPosture`; `CollectionWorkspaceProps.density` and `MetricsProps.density` are typed
  `Exclude<DensityPosture, 'spacious'>`. Their literals are unchanged.

Migration: run the 3.0 codemods (`release-3-0-map`). The four value-identical names are
rewritten; `MarkdownDensity`, `DensityProfile`, `Density` and `VerticalManifest.density`
are reported for a decision per site. No emitted CSS changes.

```contract-diff
export .#Density — removed; unreferenced (`compact | normal | comfortable`); rendered density is `DensityPosture`, the tenant decision is `DensityMode` on ./server; codemod `symbol-removed-no-replacement/.#Density` (report-only); census: 0 apps, 0 showroom
export .#DensityProfile — removed; `VerticalManifest.density` is typed `DensityPosture`; codemod `symbol-removed/.#DensityProfile` (report-only); census: 0 importers; the three apps author `comfortable`/`compact` through `VerticalManifest`, both still valid
signature .#VerticalManifest — `density` is `DensityPosture`: `airy` is removed (rhythm axis, not density), `spacious` is accepted; codemod `member-changed/.#VerticalManifest.density` (report-only); census: no app authors `airy`
export .#SurfaceDensity — removed; value-identical to `DensityPosture`; codemod `symbol-removed/.#SurfaceDensity` (rewrite); census: 0 apps, 0 showroom
export .#normalizeSurfaceDensity — renamed `normalizeDensityPosture`, same signature and behaviour; codemod `symbol-removed/.#normalizeSurfaceDensity` (rewrite); census: 0 apps, 0 showroom
export .#ActionDockDensity — removed; value-identical to `DensityPosture`; codemod `symbol-removed/.#ActionDockDensity` (rewrite); census: 0 apps, 0 showroom (the probe's local type migrated)
export .#MarkdownDensity — removed; `MarkdownViewProps.density` is `Exclude<DensityPosture, 'spacious'>` (same two literals); codemod `symbol-removed/.#MarkdownDensity` (report-only); census: 0 apps, 0 showroom
export ./server#DocumentDensityPosture — removed; value-identical to `DensityPosture`, now exported by ./server; codemod `symbol-removed/./server#DocumentDensityPosture` (rewrite); census: 0 apps
signature .#TooltipProps — `density` typed `DensityPosture` (was the unexported `TooltipDensity`); same three literals
signature .#PopoverProps — `density` typed `DensityPosture` (was the unexported `PopoverDensity`); same three literals
signature .#CollectionWorkspaceProps — `density` typed `Exclude<DensityPosture, 'spacious'>`; same two literals
signature .#MetricsProps — `density` typed `Exclude<DensityPosture, 'spacious'>`; same two literals
signature .#ActionDockProps — `density` typed `DensityPosture` (was `ActionDockDensity`); same three literals
signature .#MarkdownViewProps — `density` typed `Exclude<DensityPosture, 'spacious'>` (was `MarkdownDensity`); same two literals
signature .#ResolvedSurfaceProfileDefaults — `density` typed `DensityPosture` (was `SurfaceDensity`); same three literals
export .#normalizeDensityPosture — added; the axis name of the retired `normalizeSurfaceDensity`, same signature `(input?: string | null) => DensityPosture | undefined` and behaviour (`normal` -> `comfortable`)
export ./server#DensityPosture — added; the one posture type, replacing `DocumentDensityPosture` (same three literals)
signature .#resolveSurfaceTabsType — `density` parameter typed `DensityPosture` (was `SurfaceDensity`); same three literals
signature .#resolveListCardMinWidth — `density` parameter typed `DensityPosture` (was `SurfaceDensity`); same three literals
signature .#WorkspaceDensityConfig — `value` and `onChange` typed `DensityPosture` (were the same three literals inline)
signature ./server#DocumentRootAttributesInput — `density` typed `DensityPosture` (was `DocumentDensityPosture`); same three literals
signature ./server#DocumentRootAttributes — `data-density` typed `DensityPosture` (was `DocumentDensityPosture`); same three literals
signature ./server#MountTenantThemeOptions — `density` typed `DensityPosture` (was `DocumentDensityPosture`); same three literals
```
