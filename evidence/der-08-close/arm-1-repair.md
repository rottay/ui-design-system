# WO-DER-08 arm 1 — the repair, measured

- **Repo** `/Users/daniel/Developer/Rottay/ui-design-system`, branch `main`
- **HEAD** `5ec0c4354a10546da4c73f2a47acdb3f6f98b944` (unchanged; nothing staged,
  nothing committed)
- **Date** 2026-09-19
- **Role** writer for the last DER-08 arm. No `git add`, no commit, no baseline,
  no `roadmap/` edit, no artifact regeneration.

The arm under repair, from `evidence/der-08-close/index.md` §Arm 1:

> **FAIL** — `packages/showroom/.../playground/theme-builder/page.tsx:14,24,68`
> authors its studio draft as a `FlatTheme` literal.

**Verdict in one line: arm 1 now PASSES. Zero productive `FlatTheme` authors
remain under `packages/showroom/src`; the migrated drafts compile to exactly
what the flat literals compiled to, and a file written by the superseded flat
writer still imports onto the same bytes.**

---

## What was migrated

A studio draft travels as the governed `Theme`. `FlatTheme` is the lowering's
READ VIEW. Both showroom pages that hand a draft to `PatternBrandStudio` now
build theirs through the published lift:

| File | Before | After |
|---|---|---|
| `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` | `type FlatTheme` imported; `const INITIAL_BRAND_THEME: FlatTheme = {...}`; `useState<Theme \| FlatTheme>` | `governedTenantTheme` imported; `const INITIAL_BRAND_THEME: Theme = governedTenantTheme({...})`; `useState<Theme>` |
| `packages/showroom/src/app/probe/brand-studio/page.tsx` | `type FlatTheme` imported; `const CAPTURE_BRAND_THEME: FlatTheme = {...}` | `type Theme` from the server entry; `const CAPTURE_BRAND_THEME: Theme = governedTenantTheme({...})` |

**Not one authored value moved.** The object literal is byte-identical in both
files; only its spelling (the lift around it) and the annotation changed. The
flat literal is now the lift's ARGUMENT inside a single expression and never
leaves it — the contract's own named exception (3), and the same shape
`createTenantTheme` already uses.

`governedTenantTheme` needed no new export: it is already published on
entrypoint `.` (`contracts/runtime/suppliers/index.json`), together with
`readThemeDraft`, `projectThemeDraft`, `serializeThemeDraft` and
`deserializeThemeDraft`. **The write set therefore did not touch
`packages/core` at all.**

### Scope note (one page beyond the declared write set, and why)

The declared write set named the theme-builder page. `probe/brand-studio` was
migrated too because the acceptance criterion for this arm is a GREP over
`packages/showroom/src`, and that page is the other productive studio-draft
author: it named `FlatTheme` at `:10,26` and authored a draft literal at `:26`.
Its own header comment requires it to mirror the theme-builder draft ("this
route exists to photograph the studio, so a divergence between them would be a
divergence between the capture and the page it stands in for"), so migrating one
and not the other would have introduced exactly the divergence that comment
forbids. The change is identical in kind and moves no value. Flagged here rather
than settled silently.

---

## Arm 1's grep, after the repair

```
$ grep -rn "FlatTheme" packages/showroom/src | wc -l
60
```

Sixty hits, **zero of them a productive author**:

| Class | Count | Disposition |
|---|---|---|
| Prose: file-header comments, inline comments, JSX copy, doc-page strings and one prop-table string (`type: 'Theme \| FlatTheme \| TenantThemeDocument'`, which documents the published `BrandStudioDraft` union and its registered flat arms) | 32 | Not an author. Names the type in text; declares and constructs nothing. |
| `components/torture-surface/**` — `tortureDarkFlatTheme`, `tortureLightFlatTheme`, `themanagementmiamiFlatTheme` and the probe plumbing that carries them | 28 | **Fixture material** — named exception class (1) in the flat contract's own list, and documented in place ("These two FlatTheme objects are NOT product tenants"). They are torture/whitelabel probe tenants, not studio drafts. |

```
$ grep -rn "FlatTheme" packages/showroom/src --include=*.ts --include=*.tsx \
    | grep -E "type FlatTheme|: FlatTheme|<FlatTheme|FlatTheme>"
packages/showroom/src/components/torture-surface/index.tsx:7:  type FlatTheme,
packages/showroom/src/components/torture-surface/index.tsx:96:  readonly flatTheme?: FlatTheme;
packages/showroom/src/components/torture-surface/index.tsx:160:  draft: FlatTheme,
packages/showroom/src/components/torture-surface/index.tsx:170:type ProbeWindow = Window & { [PROBE_BRAND_THEME_KEY]?: FlatTheme };
packages/showroom/src/components/torture-surface/fixtures/torture/index.ts:49:export const tortureDarkFlatTheme: FlatTheme = {
packages/showroom/src/components/torture-surface/fixtures/torture/index.ts:404:export const tortureLightFlatTheme: FlatTheme = {
packages/showroom/src/components/torture-surface/fixtures/themanagementmiami/index.ts:71:export const themanagementmiamiFlatTheme: FlatTheme = {
```

Every surviving TYPED use is in the torture fixtures. Neither studio page
appears; both now read zero:

```
$ grep -rn "FlatTheme" "packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx" \
      packages/showroom/src/app/probe/brand-studio/page.tsx
# (no output)
```

**For the DT**, not settled by writing: whether the torture fixtures should also
move to the governed transport. They are fixture material under the contract's
enumerated exception, they are not studio drafts, and they compile through the
same door (`draftPreviewThemeIntent`'s registered flat arm), so this arm's
wording is satisfied without them. Migrating them is a separate write set.

---

## The behavioral proof

New: `packages/showroom/e2e/diagnostics/studio-draft-transport.unit.test.mjs`
(11 tests, the only file added by this repair). It runs in the showroom's
`test:diagnostics` suite, and it EXTRACTS each page's draft literal from the
page source with the TypeScript AST rather than copying it, so it measures the
draft each page actually ships.

Per page:

1. **Source** — no `FlatTheme` token anywhere in the file; exactly one draft
   declaration, annotated `Theme`, initialized by a `governedTenantTheme(...)`
   call taking one object literal; `governedTenantTheme` imported from the
   package root (not a deep import); `Theme` imported type-only from
   `/server`. For the editable page: exactly one `useState`, exactly one type
   argument, a `TypeReference` to `Theme` — no union with the read view — seeded
   with the lifted draft.
2. **The lift is a real lift** — all five governed families (`motion`, `charts`,
   `recipes`, `expressive`, `responsive`) carry the wrapper the door
   discriminates on, and `readThemeDraft(governed) === governed` by identity, so
   the studio's single reader passes it through instead of taking the flat arm.
3. **Behavior preserved exactly** — the outcome of the studio's own compile path
   (`readThemeDraft → draftPreviewThemeIntent → compileThemeIntent →
   emitThemeCss`, with `ThemeAdmissionError` caught as an outcome the way
   `PatternBrandStudio` catches it) is equal for the flat literal (the
   pre-migration transport) and the governed constant.

   Both pages author `surfaces.effectIntensity: 1`, which the bithire envelope
   refuses at the INTENT stage (`0..0.65`) — so for the drafts as shipped the
   equality is an equality of REFUSALS, which is the honest statement of "the
   page renders what it rendered before". The test therefore also runs the same
   pair with that one dial removed and asserts they agree on ~197 KB of real
   emitted CSS carrying the draft's own `#4f46e5`, so the equality can never
   pass vacuously on a refusal.
4. **File round trip** — `serializeThemeDraft` → `deserializeThemeDraft` is a
   fixed point on the bytes a file carries (JSON drops the `undefined` half of
   each governed wrapper, so the claim is stated on the serialized form, not on
   in-memory key presence), every governed family keeps wrapper-only keys on
   disk, and the restored draft compiles to the same bytes.
5. **The migration path** — a file written by the SUPERSEDED
   `serializeFlatTheme` (every draft exported before this move) still imports
   through `deserializeThemeDraft` and lands on the same bytes.
6. **Negative control** — moving one palette leaf moves the bytes.

---

## Suites

```
$ cd packages/showroom && node --test e2e/diagnostics/studio-draft-transport.unit.test.mjs
# tests 11 / # pass 11 / # fail 0

$ cd packages/showroom && pnpm test:diagnostics
# tests 153 / # pass 150 / # fail 3
```

The 3 failures are **pre-existing and unrelated to this write set**:
`axis-probe-fixture-integrity` ("every mounted fixture is stamped by the
authored components…", "the pinned composed names may only shrink") and
`skin-rule-coverage` ("the stacked sidebar rule resets the cross-axis alignment
it inherits"). Both read `packages/core` only — the authored component corpus
and the Modern skin CSS — and neither opens a showroom page or the theme door.
Nothing in this repair touches core.

```
$ cd packages/core && npx vitest run \
    src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/ \
    src/components/patterns/customization/brand-studio/tests/
 Test Files  16 passed (16)
      Tests  253 passed (253)
```

That run includes the door's own `draft-round-trip-bytes.test.ts` (arm 2's
proof, still green) and the studio's `draft-transport.test.tsx`.

```
$ cd packages/showroom && npx tsc --noEmit
.next/types/app/probe/oauth-transition/page.ts(2,24): error TS2307: ...
.next/types/app/probe/oauth-transition/page.ts(7,29): error TS2307: ...
.next/types/validator.ts(1142,39): error TS2307: ...

$ npx tsc --noEmit 2>&1 | grep -c "^src/"
0
```

Three errors, all of them in `.next/types/**` — Next's generated route types,
build output, still referencing `src/app/probe/oauth-transition/page` which no
longer exists in `src`. Zero errors in `src/**`, so both migrated pages
typecheck.

```
$ cd packages/showroom && pnpm typecheck:tests
typecheck-tests: showroom: OK — 0 errors at baseline 0 ()

$ cd packages/showroom && npx eslint \
    "e2e/diagnostics/studio-draft-transport.unit.test.mjs" \
    "src/app/(docs)/playground/theme-builder/page.tsx" \
    "src/app/probe/brand-studio/page.tsx" --max-warnings=0
# clean
```

---

## Tree delta produced by this repair

```
$ git status --short
 M packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx
 M packages/showroom/src/app/probe/brand-studio/page.tsx
?? packages/core/src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/draft-round-trip-bytes.test.ts
?? packages/showroom/e2e/diagnostics/studio-draft-transport.unit.test.mjs
```

(plus this evidence file; the core door test is the previous measurement's file,
not this one's). No baseline, no artifact, no changeset, no roadmap entry, no
`packages/core/src` source file was modified. Nothing staged, nothing committed.

---

## Where the WO stands

| Arm | Verdict |
|---|---|
| 1 — the studio draft no longer names the flat type | **PASS** — both showroom studio-draft authors migrated; grep over `packages/showroom/src` shows zero productive authors, values unchanged, outcome-identical, proved by 11 executable assertions. |
| 2 — round-trips through the governed ingress, no semantic edit to the lowering | **PASS** — unchanged; re-run green (253/253 including the door's byte round trip). |
| 3 — the flat shape's doc no longer needs the caveat | **PASS** — and the honesty gap the close measurement flagged is closed: the contract's "no productive owner returns it as an authored draft" is now true of the tree as well as of the package. |
| 4 — old transport field names zero outside registered migrations | **PASS** — unchanged. |

Two items remain for the DT, neither of them a defect and neither inside this
write set:

1. `BrandStudioDraft`'s two flat arms (`contracts/index.ts:141-145`) are a
   registered migration with no END TRIGGER and no executable pin, unlike the
   serialize window. Adjudicable: does a registered migration arm satisfy "no
   longer names the flat type"?
2. The torture-surface fixtures (28 grep hits) stay flat as fixture material
   under the contract's named exception.
