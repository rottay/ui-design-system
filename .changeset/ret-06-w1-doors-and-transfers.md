---
"@rottay/design-system": major
---

WO-RET-06 W-1 (doors and transfers). Six published doors with no measured
consumer retire, and the four root-published names WO-RET-01 transferred to
WO-RET-06 retire with their migration path. The consumer census was re-measured
with `git grep` over the tracked files of app-bithire, app-evnto and
app-platform and over the showroom.

Doors (the published map goes 38 -> 32; the consumer-contract table and its
lint-rule mirror follow, and the four icon-pack entrypoint wrappers and their
build entries are deleted):

- `./icons/foundation`, `./icons/identity`, `./icons/intelligence`,
  `./icons/operations`: zero importers. Render the role through the canonical
  facade, `<Icon name="…" />` from `@rottay/design-system/icons`; the generated
  pack modules stay as internal build output of the icon generator.
- `./styles/modern`: zero importers (app-platform carries a `next.config.ts`
  alias that resolves a file path, not the door). `dist/modern-engine.css`
  stays a build input of every bundle. Import the bundle for your vertical
  (`./styles/bithire`, `./styles/evnto`, `./styles/rottay`) or `./styles.css`;
  each carries the Modern engine stylesheet.
- `./dist/*.css`: no import of a file the package still builds.
  app-platform's `globals.css` imports `dist/platform.css`, which the 3.0
  build does not produce (consumer note X-10); file-path reads of
  `node_modules/@rottay/design-system/dist/*.css` in app tests do not go
  through the export map and are unaffected. Use the named door that
  publishes the same file: `dist/bithire.css` -> `./styles/bithire`,
  `dist/evnto.css` -> `./styles/evnto`, `dist/rottay.css` -> `./styles/rottay`,
  `dist/styles.css` -> `./styles.css`, `dist/frozen-engines.css` ->
  `./styles/frozen-engines`, and `dist/fonts/arabic-text.css`,
  `dist/fonts/editorial-display.css`, `dist/fonts/editorial-text.css`,
  `dist/fonts/grotesk-display.css`, `dist/fonts/humanist-text.css`,
  `dist/fonts/geometric-display.css`, `dist/fonts/plex-mono.css` -> the
  `./fonts/<pack>.css` door of the same name. `dist/modern-engine.css` has no
  door of its own: use the vertical bundle or `./styles.css`, as for
  `./styles/modern`.

Names (zero productive consumers; no deprecation row is registered, because
WO-RET-06 receives no debt and nothing may be left naming it):

- `VerticalTheme` (root): was declared `= FlatTheme`. Use `FlatTheme`; the
  semantic path is the Theme document.
- `RecipeVariantConfig`, `createRecipeVariant` (root): the recipe-variant
  factory and its config type, with no consumer. The package ships no
  successor factory: preset a pattern's props in the application (a typed
  props object spread onto the pattern).
- `AlertIcon` (`./icons`): the last legacy-catalog glyph binding on the icon
  door. Use `<Icon name="status.warning" decorative />` (or with `label`). The
  showroom probe that used it is migrated; the app-platform file that imports
  it is registered by the codemod map, not edited.

Each door and name has its entry in the 3.0 codemod map
(`scripts/maintain/codemods/release-3-0-map`).

```contract-diff
subpath ./icons/foundation — removed; use Icon from ./icons (zero consumers, WO-RET-06 W-1)
subpath ./icons/identity — removed; use Icon from ./icons (zero consumers, WO-RET-06 W-1)
subpath ./icons/intelligence — removed; use Icon from ./icons (zero consumers, WO-RET-06 W-1)
subpath ./icons/operations — removed; use Icon from ./icons (zero consumers, WO-RET-06 W-1)
subpath ./styles/modern — removed; the file stays a build input carried by every bundle, use the vertical bundle or ./styles.css (zero consumers, WO-RET-06 W-1)
subpath ./dist/*.css — removed; use the named ./styles/* and ./fonts/*.css doors that publish the same files (no import of a file the package still builds, WO-RET-06 W-1)
export .#VerticalTheme — removed; use FlatTheme (zero consumers, WO-RET-06 W-1)
export .#RecipeVariantConfig — removed; no successor (zero consumers, WO-RET-06 W-1)
export .#createRecipeVariant — removed; no successor (zero consumers, WO-RET-06 W-1)
export ./icons#AlertIcon — removed; use Icon name="status.warning" (zero productive consumers, WO-RET-06 W-1)
signature ./eslint#PUBLISHED_SUBPATHS — loses the six retired rows (`./icons/foundation`, `./icons/identity`, `./icons/intelligence`, `./icons/operations`, `./styles/modern`, `./dist/*.css`); it mirrors the export map, which now publishes 32 subpaths (WO-RET-06 W-1)
```
