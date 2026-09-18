# FAM-09 debrief probes

Everything in `../index.md` that is marked EXECUTED was produced here. Nothing in this
folder is product code; it exists so the DT can reproduce or falsify the census.

## Render probes

Run from `packages/core`:

```
npx vitest run --config ../../evidence/chart-paint-debrief/probes/vitest.probe.config.ts
```

Verified from this location: **3 files, 11 tests, 11 passed.** The config is
self-locating (no absolute paths to edit); it pins `root` at `packages/core` and
mirrors that package's alias map. Two host constraints are already handled in it, and
both fail loudly rather than silently if you re-host the probes:

- paths are taken through `realpathSync`, because `/tmp` is a symlink to `/private/tmp`
  on macOS and Vite resolves the realpath. Addressing the probe directory by its
  symlinked name makes every file resolve as `ERR_MODULE_NOT_FOUND` while existing;
- bare specifiers do not resolve by directory walk from outside the package root, so
  `@testing-library/react` is pinned by an explicit alias into
  `packages/core/node_modules`.

| file | proves |
|---|---|
| `scheme-divergence.test.tsx` | the `colorScheme` prop never reaches the stamped scope; `default` paints `accessible`; monochrome/vibrant leave the governed chain; scatter discards `colors` while pie honours it |
| `inline-vs-bridge.test.tsx` | a bar and a pie on one page take their first colour from two different authorities |
| `series-index-domain.test.tsx` | the stamped `data-series-index` domain per family at 6, 7 and 12 series |

## Contract type-check

`ts/` holds the declared API of index.md §2.2-§2.4 verbatim, five adapters that must
compile, and eight negative legs that must not.

```
cd probes/ts && <repo>/packages/core/node_modules/.bin/tsc -p tsconfig.json
```

Expect exit 0. Then strip every `@ts-expect-error` and re-run: expect exactly 8 errors
at the 8 declared positions. A contract that stopped refusing one of the eight reddens
the first run on an unused directive, so the check cannot pass by being permissive.
