# WO-DER-08 close measurement — the four acceptance arms, measured today

- **Repo** `/Users/daniel/Developer/Rottay/ui-design-system`, branch `main`
- **HEAD at measurement** `5ec0c4354a10546da4c73f2a47acdb3f6f98b944`
- **Date** 2026-09-19
- **Role** writer measuring the close. No `git add`, no commit, no baseline, no
  `roadmap/` edit. One file written (§Arm 2): a door test. Nothing else in the
  tree changed.

The acceptance gate under measurement (`roadmap/derivation.md`, WO-DER-08):

> the studio draft no longer names the flat type; its transport round-trips
> through the governed ingress with no semantic edit to the lowering; the flat
> shape's documentation no longer needs the "also an authoring draft" caveat;
> grep for the old transport field names is zero outside registered migrations.

**Verdict in one line: three of four arms PASS as measured; arm 1 does not, on
one live consumer outside this write set (the showroom theme builder still
authors its studio draft as a `FlatTheme` literal). The WO is NOT closeable
today; the remaining work is small and named in §Arm 1.**

---

## Arm 1 — "the studio draft no longer names the flat type" — **FAILS** (one live consumer)

### What the studio itself does

`PatternBrandStudio`'s transport is the governed `Theme`:

- `PatternBrandStudioProps.onChange: (next: Theme) => void`
  (`packages/core/src/components/patterns/customization/brand-studio/contracts/index.ts:176`)
- the file export is `serializeThemeDraft(draft: Theme)` /
  `deserializeThemeDraft(json): Theme`, the latter delegating to the door's own
  `readThemeDraft`
  (`.../brand-studio/runtime/file-export/index.ts:49,62`)
- the component normalizes once through `readThemeDraft` and reads leaves
  through `projectThemeDraft` (`.../brand-studio/index.tsx:56-57,1664`)

The 36 `FlatTheme` occurrences in `brand-studio/index.tsx` are the editor's READ
VIEW (`FlatThemeEditor`, `draftPalette`, `draftChrome`, `applyHostileFlatTheme`,
`evaluateFlatThemeContrast`) plus the type import and the superseded-pair
re-export. Retyping those reads to the governed `Theme` is explicitly the
deferred (b) lot — the WO's own **Do NOT** — so they are not an arm-1 failure.

### What still names the flat type on the draft path

| Site | Lines | Classification |
|---|---|---|
| `brand-studio/contracts/index.ts` — `BrandStudioDraft = Theme \| DeepPartial<Theme> \| FlatTheme \| Partial<FlatTheme>` | `:141-145` | Registered migration, documented as such at `:132-140`. **But** unlike the serialize window it carries **no named END TRIGGER and no executable pin** — nothing measures when the flat arms may go. |
| `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` | `:14` (`type FlatTheme` import), `:24` (`const INITIAL_BRAND_THEME: FlatTheme = {...}`), `:68` (`useState<Theme \| FlatTheme>`) | **The failure.** The DS's own reference studio consumer still AUTHORS its draft as a flat literal and names the flat type to do it. This is the "showroom theme-builder (ola 9)" item the WO's own 2026-09-16 progress note left pending. |
| `packages/showroom/src/app/(docs)/patterns/[group]/[pattern]/pattern-preview-fixtures.tsx` | `:1237,1243-1244` | Rides the flat arm implicitly (`ComponentProps<...>['value']` initialised with `{ palette: { primaryColor } }`) but does not name the type. Lesser, same cause. |

### Proof

```
$ grep -n "FlatTheme" packages/core/src/components/patterns/customization/brand-studio/contracts/index.ts
16:import type { FlatTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
144:  | FlatTheme
145:  | Partial<FlatTheme>;

$ grep -rn "FlatTheme" "packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx"
14:  type FlatTheme,
24:const INITIAL_BRAND_THEME: FlatTheme = {
68:  const [theme, setTheme] = useState<Theme | FlatTheme>(INITIAL_BRAND_THEME);
```

### Bounded repair (NOT applied — outside this write set)

1. `theme-builder/page.tsx`: build the initial draft through a governed
   constructor and type the state `Theme`. The values move unchanged; only the
   spelling of the initial literal and the state type change. The page is a
   showroom consumer, not a draft-transport file, so it is outside the write set
   declared for this measurement, and (per the same progress note) showroom
   typecheck is not demonstrable from a worktree whose `node_modules` symlinks to
   another checkout.
2. `brand-studio/contracts/index.ts`: give the two flat arms of
   `BrandStudioDraft` the same treatment the serialize pair already has — a named
   END TRIGGER plus an executable pin in `tests/draft-transport.test.tsx`. This is
   inside the write set, but it is an adjudicable question (does a registered
   migration arm satisfy "no longer names the flat type"?) rather than a defect,
   so it is reported for the DT rather than settled by writing.

Until (1) lands, the arm's claim is not true of the tree.

---

## Arm 2 — "round-trips through the governed ingress with no semantic edit to the lowering" — **PASSES** (proof strengthened today)

### State before today

The round trip was proved only in the studio's own test dir
(`brand-studio/tests/draft-transport.test.tsx`), and on the compiled OBJECT:
`expectSameIntent` compares `patch`, `ledger`, `baseline` and
`compileThemeIntent(...).compiled` with `toEqual`. The door's own dir had
`theme-transport-parity.test.ts`, which compares draft-door against
document-door on equal bytes — a different claim (transport vs transport, not
serialize → deserialize → recompile).

So the acceptance's exact words ("its transport round-trips through the governed
ingress") had no proof at the door, and no byte-level proof anywhere.

### What was added

`packages/core/src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/draft-round-trip-bytes.test.ts`
(new, the door's own test dir — the only file this measurement wrote).

Per vertical (`rottay`, `bithire`, `evnto`), over a draft authoring palette,
typography, motion, surfaces and chrome:

1. the emitted block is real (contains the scope selector and the authored
   `#2F5BE8`), so the equalities below cannot pass vacuously;
2. governed draft → `JSON.stringify`/`JSON.parse` → `readThemeDraft` → compile →
   `emitThemeCss` is **byte-identical** to the un-round-tripped compile;
3. the superseded flat file lands on the same bytes through the same door;
4. JSON preserves the governed wrapper key (`['value']`) the door discriminates
   on;
5. negative control: moving one authored leaf moves the bytes.

The test names no component — it exercises `governedTenantTheme`,
`readThemeDraft`, `draftPreviewThemeIntent`, `compileThemeIntent`, `emitThemeCss`
— so it is a property of the door, which is what the acceptance asserts.

"No semantic edit to the lowering" holds by construction: nothing under
`lowering/` was touched by this measurement, and the working tree carries exactly
one added file (see §Tree delta).

### Proof

```
$ npx vitest run src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/draft-round-trip-bytes.test.ts
 ✓ |unit| .../ingress/tests/draft-round-trip-bytes.test.ts (15 tests) 876ms
 Test Files  1 passed (1)
      Tests  15 passed (15)

$ npx vitest run src/components/patterns/customization/brand-studio/tests/draft-transport.test.tsx \
      src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/
 Test Files  11 passed (11)
      Tests  195 passed (195)

$ npx vitest run src/components/patterns/customization/ tests/integration/consumer/brand-studio-callback-migration.test.tsx
 Test Files  14 passed (14)
      Tests  153 passed (153)

$ npm run typecheck:tests
typecheck-tests: core: OK — 0 errors at baseline 0 ()
```

---

## Arm 3 — "the flat shape's documentation no longer needs the caveat" — **PASSES**

Every doc that defines the flat shape states the opposite of the caveat, with
the exceptions ENUMERATED rather than hand-waved:

| Doc | Line | What it says |
|---|---|---|
| `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts` | `:241-256` | "It is not a transport and no productive owner returns it as an authored draft (WO-DER-08)", then names four measured exceptions: test/fixture material; the superseded serialize window; the ingress's own draft constructors (the deferred (b) retype); `tenant-preview`'s superseded `brand-theme` arm. |
| `packages/core/docs/reference/contracts/index.md` | `:59-66` | "NOT an authoring surface and NOT a transport (WO-DER-08)… two registered exceptions remain". |
| `packages/core/docs/architecture/tenant-authority/index.md` | `:21-23` | "not the shape an author edits or serializes: the authoring draft is the governed `Theme`". |
| `ui-design-system/docs/architecture/index.md` | `:283-286` | "`Theme` … is what a DRAFT travels as too… `FlatTheme` is the lowering's READ VIEW … never an authoring surface and never a transport." |
| `docs-engineering/.../runtime/tenancy/README.md` | `:450-458` | Records the `createTenantFlatTheme` → `createTenantTheme` rename and why: the old name "returned the lowering's flat READ VIEW and therefore made that view an authoring surface too". |

```
$ grep -rniE "flattheme" --include=*.md docs/ packages/core/docs/ ../docs-engineering/engineering/design-system/ \
    | grep -viE "serializeFlatTheme|deserializeFlatTheme|flatThemeTo"
# -> no hit restates an "also an authoring draft" caveat; the five rows above are the definitional ones.
```

Caveat noted for honesty, not as a failure: the doc wording is now *ahead of*
arm 1 — the contract says "no productive owner returns it as an authored draft"
while the showroom theme builder still authors one. Landing the §Arm 1 repair
makes the sentence true of the tree as well as of the DS package.

---

## Arm 4 — "grep for the old transport field names is zero outside registered migrations" — **PASSES**

| Name | `src/` + `scripts/` | Where it survives | Registered? |
|---|---|---|---|
| `brandThemePath` | **2** | `scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/index.test.mjs:5,48` — a file-header sentence and the assertion that a row on the retired key declares NO door | Yes: it is the test OF the migration, which the arm's wording excludes |
| `staticBrandThemePath` | **1** | same file, same header sentence | Yes, same |
| `serializeFlatTheme` / `deserializeFlatTheme` | published window | `file-export/index.ts:75-90` with an explicit **END TRIGGER** (remove when `contracts/runtime/suppliers/index.json` stops naming them on entrypoint `.`) and an executable pin in `draft-transport.test.tsx:243-257` | Yes. Trigger is **unmet**: both names are still in the published snapshot (`entrypoints["."].exports`), so they must stay |
| `flatTheme` (payload key) | **3** non-test | `tenant-preview/runtime/preview-css/index.ts:157,168,178` — the `LegacyBrandThemeSource` reader that lifts an old payload via `governedTenantTheme` | Yes, documented in place as "A REGISTERED MIGRATION, not a compatibility shim that stays". Remaining `flatTheme:` hits are the `lowerFlatThemeFixture({ flatTheme })` test-helper parameter — exception class (1) |

The `staticBrandThemePath` / `brandThemePath` **window is CLOSED**, not merely
registered: `INGRESS_ARMS['static-brand-theme']` now declares
`manifestIngressKey: 'staticThemePath'` and `registryKey: 'themePath'` with no
superseded arm, and `readIngressKey` has no fallback
(`scripts/check/tokens/cascade/probe/runtime/ingress/index.mjs:200-212,283-295`).

```
$ grep -rn "brandThemePath" packages/core/src packages/core/scripts | wc -l
2
$ grep -rn "staticBrandThemePath" packages/core/src packages/core/scripts | wc -l
1
$ node --test packages/core/scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/index.test.mjs
# tests 6 / # pass 6 / # fail 0
```

Out of scope of the arm but recorded so nobody re-measures it: 120 files under
`packages/core/artifacts/quality/programs/modern-rescue/cascade-proofs/**` still
carry `"staticBrandThemePath"` as a value inside sealed Modern Rescue evidence
JSON. That tree is historical evidence under the owner seal, not source and not
a manifest the generator reads; the manifest tree those keys came from
(`governance/manifest/`) no longer exists in this checkout.

---

## The OPEN question from the progress log (2026-09-16 21:10, item 2)

> "(2) `createTenantFlatTheme` y `preview-css` siguen autorando flat (6 sitios) —
> fuera de este lote, adjudicar si es scope de DER-08 o del retype (b) diferido."

**Answered from the WO record's own Do-NOT, and the premise has since moved.**

The WO's **Do NOT** reads: *"Do not retype the lowering's reads to the governed
Theme in this lot (that is the (b) retype deferred by the review, a separate
later lot with its own write set)."* Both sites are lowering-read sites, not
draft transports, so both fall under (b) — and both have already been brought as
far as DER-08's fence allows:

- **`createTenantFlatTheme` no longer exists.** `grep -rn createTenantFlatTheme
  packages/core/{src,scripts,contracts}` returns **zero**. Its successor
  `createTenantTheme(config): Theme`
  (`src/infrastructure/runtime/tenant/runtime/authoring/configuration/index.ts:140-183`)
  RETURNS the governed `Theme`. It assembles a flat literal at `:169` only as the
  argument to `governedTenantTheme`, in the same expression — the value never
  leaves the function. That is exactly named exception (3) in the contract's own
  list: the flat shape is the type `liftAuthoredTheme` DECLARES as its input, and
  retyping that input is (b).
- **`preview-css`'s flat naming is confined to the registered migration.** The
  productive `PreviewSource` union carries `theme: Theme`
  (`preview-css/index.ts:318`); `flatTheme` appears only on
  `LegacyBrandThemeSource` and its reader (`:157,178`), and `draftPreviewSource`
  builds its theme through `createTenantTheme` (`:326`).

So: **not DER-08 scope.** Nothing in those six sites blocks this WO. What would
change them is the (b) retype of `liftAuthoredTheme`'s input, which needs its own
write set.

Correction to the same record while here: step 3 of the WO says
`liftAuthoredTheme` has "zero production callers (measured 2026-09-15)". That is
**wrong today and was corrected by the 2026-09-16 19:30 note**. It has three
production call sites, all inside the door that owns the lift
(`ingress/presentation/preview/index.ts:197,316,328`); `preview-css` only names
it in a comment and calls the door's `governedTenantTheme`
(`preview-css/index.ts:288-292`). Confining them to the single door is the correct
end-state short of (b); "retire liftAuthoredTheme" is not reachable inside this
WO's fence, because its input type IS the flat shape.

---

## Honest close verdict

**NOT CLOSEABLE today. One arm fails, on one named file.**

| Arm | Verdict |
|---|---|
| 1 — studio draft no longer names the flat type | **FAIL** — `packages/showroom/.../playground/theme-builder/page.tsx:14,24,68` authors its studio draft as a `FlatTheme` literal. Secondary: `BrandStudioDraft`'s flat arms are a registered migration with no end trigger or pin. |
| 2 — round-trips through the governed ingress, no semantic edit to the lowering | **PASS** — proved at the door today, on equal CSS bytes, three verticals, both arms, with a negative control (15/15). |
| 3 — flat shape's doc no longer needs the caveat | **PASS** — five definitional docs state the opposite with enumerated exceptions. |
| 4 — old transport field names zero outside registered migrations | **PASS** — `brandThemePath` 2 / `staticBrandThemePath` 1, all inside the migration's own test; its ingress window is closed and pinned 6/6; the serialize window is published with an unmet end trigger. |

To close: migrate the showroom theme builder off the flat literal (small,
values unchanged), and adjudicate whether `BrandStudioDraft`'s registered flat
arms need an end trigger + pin before arm 1 may be called met. Everything else
the acceptance names is measured and green at
`5ec0c4354a10546da4c73f2a47acdb3f6f98b944` plus the one added door test.

---

## Tree delta produced by this measurement

```
$ git status --short
?? packages/core/src/infrastructure/compilers/runtime/theme/runtime/ingress/tests/draft-round-trip-bytes.test.ts
```

(plus this evidence file). No source file, baseline, artifact, changeset or
roadmap entry was modified; nothing was staged or committed.
