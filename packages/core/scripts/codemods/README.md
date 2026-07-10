# Codemods (WO-ARC-01)

Migration scripts for apps consuming `@rottay/design-system` to adopt the vocabulary
normalized by WO-ARC-01 (proposal P-13, `roadmap/architecture.md`). Every deprecated alias
these codemods migrate away from (`SizeType`, the conflated `variant` values on
Badge/Tag/Callout/Avatar) keeps compiling on its own -- running a codemod is an opt-in
migration, not a required fix, until the alias-removal release below.

**Deprecation window**: aliases are retained for exactly one release after WO-ARC-01 lands.
**Alias removal release**: not yet cut as of this WO's implementation (2026-07-09) -- the
orchestrator/owner names the actual removal release when it is scheduled, and that release
should update this line and the `@deprecated` JSDoc tags across the touched `.types.ts` files
naming it explicitly.

These scripts are recorded here by the design-system repo; per the WO's fences, they are never
executed against `app-bithire`, `app-evnto`, `app-platform`, or any other app repo from within
this repo. Each app's own orchestrator runs its own copy at repin time.

## sizetype-to-size.mjs

Rewrites a type-only `SizeType` import from `@rottay/design-system` to `Size`, and every bare
`SizeType` identifier reference in that file, to `Size`.

```
node sizetype-to-size.mjs <path>              # dry run (default): report files that would change
node sizetype-to-size.mjs <path> --write      # apply the rewrite
```

`<path>` defaults to the current directory.

### Limitations

- Only rewrites the **type import and identifier**, not JSX prop literal values (e.g. a
  `size="small"` string passed to a DS component). `SizeType`'s values (`'small' | 'middle' |
  'large' | 'default'`) still compile as `Size` accepts them only through each component's own
  `Legacy*Size` alias union, not through the bare `Size` type -- rewriting a literal value
  correctly requires knowing which component it is being passed to (Collapse's legacy alias
  differs from Space's, etc.), which is a per-component, AST-aware transform out of reach for a
  regex-based script. Leaving literal values untouched is deliberate: they keep compiling via
  the `Legacy*Size` aliases either way, so this codemod is safe to run without that transform.

## variant-tone-split.mjs

Rewrites a literal `variant="..."` JSX attribute on `Badge`, `Tag`, `Callout`, or `Avatar` to
the equivalent `tone="..."` value, for the subset of values each component's
`TONE_TO_*_VARIANT` map covers.

```
node variant-tone-split.mjs <path>              # dry run (default): report files that would change
node variant-tone-split.mjs <path> --write      # apply the rewrite
```

### Limitations

- Only a **literal string** attribute is rewritten (`variant="primary"`). `variant={expr}` is
  left untouched -- resolving an arbitrary expression requires evaluating it, out of reach for
  a regex-based script with no AST library available (this package adds no new npm
  dependencies; see `roadmap/architecture.md` WO-ARC-01's fences).
- Only rewritten when the literal value has a Tone equivalent. `Badge`/`Avatar`'s `'secondary'`
  and `'gradient'`, and `Tag`'s `'secondary'`, have none and are left as `variant` (still valid,
  still deprecated, not silently dropped).
- Matched by **JSX tag name only** (`<Badge`, `<Tag`, `<Callout`, `<Avatar>`), not by verifying
  the tag's import traces back to `@rottay/design-system` in that file. A locally-defined or
  differently-sourced component sharing one of these tag names would be a false positive.
  **Always review the dry-run list, and the diff, before running with `--write`.**

## Dry-run evidence (recorded at implementation time)

Both scripts were run against a scratch fixture (not any app repo) containing a `SizeType`
import/usage and one `variant="..."` literal per component, including one unmappable value
(`Badge variant="secondary"`) and one dynamic value (`Button variant={dynamicVariant}`, which
`Button` is intentionally excluded from this codemod's scope for -- see WO-ARC-01's report).

```
$ node sizetype-to-size.mjs <fixture>
sizetype-to-size: 1 file(s) would change (scanned 1)
  <fixture>/src/example.tsx

Dry run only -- re-run with --write to apply.

$ node variant-tone-split.mjs <fixture>
variant-tone-split: 1 file(s) would change (scanned 1)
  <fixture>/src/example.tsx

Dry run only -- re-run with --write to apply. Review each change: this codemod
matches JSX tag names only, not verified component imports (see README.md).
```

After `--write`, the fixture's `variant="success"` (Badge) became `tone="success"`,
`variant="error"` (Tag) became `tone="danger"`, `variant="warning"` (Callout) became
`tone="warning"`, `variant="primary"` (Avatar) became `tone="primary"`, `variant="secondary"`
(Badge) was left untouched, and `variant={dynamicVariant}` (Button) was left untouched --
matching every case documented above.
