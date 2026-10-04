---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-SPACE-ENGINE-SIZE). The deprecated type `LegacySpaceSize` (`'small' | 'middle' | 'large'`) retires from the package root. `SpaceSize` (`'sm' | 'md' | 'lg'`) is the one named size type of `Space`.

`SpaceProps.size` stopped accepting the alias earlier in this line (`.changeset/ret-01-legacy-size-acceptors.md`), which kept the name exported and deprecated because it typed the key of `SPACE_SIZE_MAP`. That statement is superseded here: the key type is now a type of the Space contract module that the package root does not export. `SPACE_SIZE_MAP` keeps its three keys and its three values, `SPACE_DEFAULTS.size` keeps the value `'small'`, and no engine file changes: Classic and Rustic still resolve either spelling through `toLegacySize`, and Modern still stamps the value it is given. Nothing renders differently.

Replacement: type with `SpaceSize`. The members differ (`sm | md | lg` in place of `small | middle | large`), so a value typed by the retired alias that still spells an Ant Design size stops compiling, which is already the state of the `size` prop it would have been passed to. To name the keys of the table, write `keyof typeof SPACE_SIZE_MAP`.

Census, 2026-10-03, TypeScript AST over `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform: zero imports of `LegacySpaceSize` and zero imports of `SPACE_SIZE_MAP` outside the package. No application changes anything for this removal.

Codemod. The 3.0 map moves an import binding of `LegacySpaceSize` to `SpaceSize` and every reference bound to it follows. Dry-run over the showroom and the three applications: zero sites.

Tests. The Space size suite keeps its assertions and adds two compiled refusals: the package root has no `LegacySpaceSize`, and `<Space size="middle">` is a type error while `SPACE_SIZE_MAP` keeps the three engine keys.

The compatibility window is the one `.changeset/ret-01-legacy-size-acceptors.md` states: marked on 2026-07-09 at 2.16.6 for one release, with 2.17.0 through 2.19.36 released since.

```contract-diff
export .#LegacySpaceSize — removed; zero imports outside the package; `SpaceProps.size` already refused it; migrate to `SpaceSize` (RET-01-SPACE-ENGINE-SIZE)
signature .#SPACE_SIZE_MAP — its key type is no longer a root export; the same three keys `small`, `middle`, `large` and the same values; name the keys with `keyof typeof SPACE_SIZE_MAP` (RET-01-SPACE-ENGINE-SIZE)
```
