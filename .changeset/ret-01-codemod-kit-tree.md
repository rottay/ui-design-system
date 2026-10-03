---
"@rottay/design-system": patch
---

WO-RET-01: the codemod kit takes the folder/index shape the scripts tree
requires. No public surface moves: nothing under `scripts/` is published (the
package `files` list ships `dist/` and three contract documents), no entrypoint,
subpath, export or signature changes, and the kit's behaviour is unchanged.

What moved, all under `packages/core/scripts/maintain/codemods/`:

- The 3.0 map is `release-3-0-map/index.json` (was `maps/3.0/index.json`); it
  is still the default of `pnpm -C packages/core codemods <dir>`, and `--map`
  still takes any path.
- The four test files are `tests/{cli,fixtures,map,resolve}/index.test.mjs`
  (were `tests/<name>.test.mjs`); run them with
  `node --test packages/core/scripts/maintain/codemods/tests/*/index.test.mjs`.
- The fixtures live under `tests/fixtures/<class>/<case>/`, every file as
  `folder/index.*`: a case's expected findings are `report/index.json`, its own
  map and surface are `map/index.json` and `surface/index.json`, and a fixture
  file that was `name.ext` is `name/index.ext`. TypeScript only reads a config
  named `tsconfig.json`, so the one fixture that needs it stores
  `tsconfig/index.json` and the harness writes it under its real name in the
  working copy. Two fixtures gain a one-line consumer barrel so no folder wraps
  a single child. Every expected finding is the same; only the `file` spelling
  follows the new names.

Two gates follow the move:

- `deprecations` reads the map and the fixtures at their new paths
  (`CODEMOD_MAP_PATH`, `CODEMOD_FIXTURES_PATH`).
- `retired-vertical-identity` gains one declared class, by path and by JSON
  position: in a codemod release map
  (`scripts/maintain/codemods/release-*-map/index.json`), inside an entry of
  class `subpath-removed`, the `subpath`, the `id` that restates it and the
  occurrences of that same door in the entry's own prose are migration
  sources, the name a consumer is moved away from, and are not residues. A
  `replacement`, an entry of any other class, any other retired name, the
  map's header, a map that does not parse and every other file stay under the
  law; the map is scanned, not excluded.
