# Composition map — first-party vertical CSS artifacts

Independent read of the build code, 2026-07-27. Sources read (read-only):

- `ui-design-system/packages/core/scripts/build-vertical-artifacts.mjs`
- `ui-design-system/packages/core/scripts/build-vertical-css.mjs`
- `ui-design-system/packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts`
- `ui-design-system/packages/core/src/infrastructure/compilers/kernel/foundation/css/scope-projection/index.ts`

## 1. Who writes `artifacts/<slug>/index.css`

`scripts/build-vertical-artifacts.mjs` is the only writer. For each spec in
`FIRST_PARTY_ARTIFACT_SPECS` (exactly `bithire`, `evnto`, `rottay`) it:

1. imports the authored BrandTheme from **`dist/`** (not `src/`) —
   `dist/foundation/tokens/ts/presentation/brand-themes/{bithire,evnto,platform}/index.js`;
2. calls `compileBrandTheme({ brandTheme, tenantSlug: slug })` →
   `compiled.cssVariables`, a flat `Record<string,string>` of `--ds-*` names;
3. runs an APCA body-text check on the generated `--ds-color-<role>-900` ramp
   steps only (build fails on violation);
4. reads `artifacts/<slug>/_source/extension.css` verbatim from disk;
5. calls `renderVerticalArtifact(...)` and writes the result to
   `src/foundation/tokens/css/facade/artifacts/<slug>/index.css`.

`--check` mode re-renders and byte-compares instead of writing; it is wired as
`lint:artifacts`, which is chained into `lint` (and `pretest`). So a hand-edit
of `index.css` is a gate failure, not a silent drift.

`scripts/build-vertical-css.mjs` is a **separate, later** step. It does not
touch `artifacts/*/index.css`; it concatenates base tokens + modern engine +
the per-vertical baseline into `dist/*.css` and `styles/*.css` bundles. The
package script is `build:vertical-css = build-vertical-artifacts.mjs && build-vertical-css.mjs`,
so the artifact render always precedes the bundle build.

## 2. Exact composition of `index.css`

`renderVerticalArtifact()` builds the string as
`header + "\n\n" + compiledBlock + "\n\n" + extensionSection + "\n"`, then passes
the **whole document** through `projectFirstPartyArtifactScopes(css, tenantSlug, verticalKey)`.

| Order | Section | Delimiter / first line | Content |
|---|---|---|---|
| 1 | Generated header | `/* GENERATED — do not edit */` (line 1) then a `/* … */` block naming both authored sources and the regenerate command | 11 lines, identical shape in all three artifacts |
| 2 | Compiled block | `/* === Compiled from BrandTheme via compileBrandTheme — do not edit === */` (**line 13** in all three) | Next line is the scoped selector; then one `  <name>: <value>;` line per compiled variable, **keys sorted with `Object.keys().sort()`**, closed by `}` |
| 3 | Declared extension | `/* === Declared artifact extension (authored source, mechanically scoped) === */` (line 1041 bithire / 336 evnto / 479 rottay) | `extension.css` with `^\s+` and `\s+$` stripped, then scope-projected; runs to EOF |

The marker string requested in the task ("Compiled from BrandTheme via
compileBrandTheme") is the section-2 delimiter above; note it uses a **U+2014 em
dash**, not a hyphen.

Compiled-block selectors (before projection) come from the spec, not from the theme:

- bithire: `html[data-tenant='bithire']`
- evnto: `html[data-tenant='evnto']`
- rottay: `html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light`

## 3. Is extension.css inserted verbatim? — No

Two transformations apply, so a naive "does index.css contain extension.css"
substring test **fails** (and did fail in this audit, by design):

1. **Whitespace trim**: `extensionCss.replace(/^\s+/,'').replace(/\s+$/,'')`.
2. **Scope projection** (`projectFirstPartyArtifactScopes`): a dependency-free
   scanner walks the document, skipping comments, strings, `(...)` and `[...]`
   nesting, and at-rule preludes. In every **rule prelude** (never in a
   declaration value, comment, or string) each compound
   `html[data-tenant='<slug>']` is rewritten to
   `:is(html[data-tenant='<slug>'], :where([data-ds-root][data-vertical='<verticalKey>']))`.
   Both quote styles are accepted, so bithire's authored `html[data-tenant="bithire"]`
   is matched even though the compiled block uses single quotes. `verticalKey`
   is `bithire` / `evnto` / **`platform`** (rottay's vertical key is `platform`,
   not `rottay`).

Because `:is()` takes its specificity from the most specific argument and the
provider arm is wrapped in `:where()` (specificity 0), the projection is
specificity-neutral by construction.

## 4. BrandTheme TS sources and staleness

`ls -la` of `packages/core/src/foundation/tokens/ts/presentation/brand-themes/`:

| File | Size | mtime |
|---|---|---|
| `bithire/index.ts` | 36 947 | 2026-07-23 18:15 |
| `evnto/index.ts` | 4 800 | 2026-07-17 03:20 |
| `platform/index.ts` (rottay) | 11 121 | 2026-07-23 18:15 |
| `index.ts` (barrel) | 504 | 2026-07-17 19:34 |
| `fixtures/themanagementmiami/index.ts` | 21 473 | 2026-07-22 16:24 |
| `fixtures/torture/index.ts` | 24 383 | 2026-07-17 00:13 |
| `fixtures/divergence-editorial/index.ts` | 2 351 | 2026-07-18 11:05 |
| `fixtures/divergence-sober/index.ts` | 2 834 | 2026-07-18 11:05 |

Fixtures are deliberately not registered in `FIRST_PARTY_ARTIFACT_SPECS` and
produce no artifact.

**Staleness flag: NONE.** Artifact mtime is 2026-07-27 06:12; the matching
`dist/` brand-theme modules are 2026-07-27 06:11–06:12; `_source/extension.css`
is 2026-07-25 13:48. `find src -type f -newermt "2026-07-27 06:12:00"` returns
only the three `index.css` artifacts themselves — no authored source in
`packages/core/src` is newer than the artifacts.

This was confirmed positively, not just by mtime: re-rendering all three
artifacts from `dist` `compileBrandTheme` + the snapshot `extension.css` through
the real `renderVerticalArtifact` produces **byte-identical** output
(SHA-256 match on all three). See `scripts/reproduce-artifact.mjs`.
