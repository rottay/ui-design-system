# W-D · default.css neutralization — BLOCKED (analysis + patch plan, no edits)

**Verdict: no edit made to `default.css`.** The file is byte-identical to the
pre-edit baseline. The safe subset under the mission's own coverage law is
empty, and the one mechanically-available move drains the counter without
draining the identity. Evidence below; the owner decision is at the end.

## Step 0 — porcelain and hunk discipline

```
 M packages/core/src/foundation/tokens/css/foundation/themes/default.css
```

Foreign-dirty from the concurrent visual WIP: **3 hunks, +14 -5**, all
coherent and all moving TOWARD tenant derivation (focus ring → `--ds-tint-24` /
`color-mix` over `--ds-color-primary`; skeleton wave → surface aliases +
primary tint; the removed `rgba(0,0,0,0.12)` is achromatic and was never pinned).
Nothing in that WIP touches a pinned literal. W-D added **zero** hunks:

```
diff -q default.PREEDIT.css <live default.css>  →  identical
git diff --stat  →  still 1 file, 14 insertions(+), 5 deletions(-)
```

Baselines captured before any analysis: `default.PREEDIT.css` (live, dirty) and
`default.HEAD.css` (git HEAD), both in the W-D scratchpad.

## Step 1 — the cascade law that makes coverage decidable

`facade/entrypoints/base.css:32` imports `default.css` into
`layer(rottay-tokens)`. The tenant artifact is **UNLAYERED** by law
(`bithire.css:20`, `TENANT_PAINT_IS_UNLAYERED`). Unlayered rules outrank every
cascade layer, so an artifact declaration wins its channel outright and
specificity never enters the comparison.

Coverage therefore reduces to a decidable question: *does the artifact declare
this channel in a root-matching arm for this state?* This also settles the
`html.dark` question — the block is layered, so it can never beat a tenant.

## Step 2 — coverage, both paths

Measured over 3 verticals x 3 states (static artifacts, postcss + the Round 3
selector-lib) and over the DB/Appearance path (the compiler run directly on a
representative tenant declaring primary/secondary/accent/background).

**133 channels carry the 43 pinned literals. The DB/Appearance path emits 3 of
them.** `deriveTenantColorRamps` — the function that emits
`--ds-color-{success,warning,error,info}-{50..900}` — is reachable only from
`compileBrandTheme`, never from the appearance path. So 130 of the 133 channels
fall through to `default.css` for every DB tenant.

| coverage | literals | note |
|---|---:|---|
| static 3x3 **and** DB path | **2** | `#0c0c0e`, `#7a6a5a` — both conditional, both separately blocked (Step 4) |
| static 3x3 only, no DB | 11 | the ramp steps with no component twin |
| neither | 30 | uncovered at tenant scope today; the literal is what renders |

Per-literal table: `wd-coverage.json`. The uniform shape of the 30: exactly ONE
covered channel (the `--ds-color-{role}-{step}` ramp anchor, which all three
verticals author) plus N uncovered component twins (`--ds-button-error-bg`,
`--ds-input-error-border`, …) that restate the same literal. `#ef4444` is the
extreme: 1 covered anchor, 24 uncovered twins.

## Step 3 — why the twins cannot be re-pointed at the anchors

The obvious repair — rewrite `--ds-button-error-bg: #ef4444` as
`var(--ds-color-error-500)` — is a **repaint**, because the tenants do not agree
with the DS on the anchor:

| `--ds-color-error-500` | bithire | evnto | rottay |
|---|---|---|---|
| value | `#B03D3B` | `#C12825` | `#EF4444` |

Only rottay matches, which is the audit's Finding 1 restated: `default.css` IS
rottay. Today bithire paints its error *ramp* `#B03D3B` while its error *button*
paints `#ef4444` — a real, pre-existing defect, and fixing it is a visible
change to two shipped verticals. Out of scope for a zero-change phase; recorded
for the owner, not executed.

## Step 4 — the two both-covered literals, and why each is still blocked

* `#0c0c0e` / `--ds-color-text-on-primary` — pinned byte-identical by
  `themes/tests/default-theme-neutral-derivation.test.ts`
  (`NO_EXACT_STEP_LITERALS.root`), whose entire purpose is to freeze these
  values. Two Modern skins carry live axe-contrast reasoning naming this exact
  value (`skin/calendar.css:127`, `skin/tour.css:212` — "#0C0C0E on TMM teal =
  3.6:1, the R2 axe failure"). DB coverage is conditional: the Appearance
  compiler derives the ink from a hex primary and emits nothing without one
  (`appearance.test.ts:92`). Changing it is an accessibility decision, not a
  mechanical repair.
* `#7a6a5a` / `--ds-color-secondary-700` — DB coverage is conditional on the
  tenant declaring `secondary`. It is 1 of 10 steps whose other 9 siblings carry
  unpinned chromatic literals, so neutralizing this step alone leaves an
  incoherent ramp without draining the family.

## Step 5 — the counter-gaming objection (the reason to stop)

The 11 static-covered ramp steps CAN be re-expressed as
`color-mix(in srgb, var(--ds-color-{role}-500) N%, #fff|#000)`. Dry-run applied
to a scratch copy, composed acid over the real cascade:

```
TENANT SCOPE   bithire/evnto/rottay x default/light/dark   +0 -0 ~0   (9/9)
TOTAL TENANT DELTA = 0
NO-TENANT      root/default ~13 · root/light ~13 · root/dark ~11
```

Adversarially verified — the detector is load-bearing, not a W-A-style lying
comparator. Planting `--ds-button-error-bg: #123456` (uncovered) is caught on
evnto in all 3 states; planting `--ds-color-error-500: #654321` (covered) is
correctly invisible, which independently re-proves the coverage claim.

So the change is provably safe for the shipped verticals. It is still the wrong
change: the mix is taken over `--ds-color-{role}-500`, which is **itself
rottay's Tailwind palette**. The rendered color stays rottay's green; only the
spelling changes. The pinned inventory would fall 43 → 32 while not one pixel of
Rottay identity left the global ground, and every DB tenant — none of which is
covered on these channels — would shift slightly for nothing. That is a counter
that lies, and the ledger it moves is the one this phase exists to make honest.

## Step 6 — the pinned inventory moved UP, and not because of this phase

`modern-tenant-value-free.test.ts` is **RED on main right now**, and W-D did not
cause it:

```
declares no tenant literal beyond the pinned decrease-only inventory
+ "…/themes/default.css :: #0f0f12"
+ "…/themes/default.css :: #141417"
```

`TENANT_COLORS` is computed from the three BrandTheme objects. W-A's
(uncommitted) ground migration added `backgroundSecondaryColor: '#0F0F12'` and
`backgroundTertiaryColor: '#141417'` to the rottay palette
(`brand-themes/platform/index.ts:511-512`; `git show HEAD:` for that file
contains neither). Those two values were already declared in `default.css`
(lines 191, 192, 197) — they simply were not *classified* as tenant literals
until rottay's palette claimed them.

The test is telling the truth: rottay's canvas ramp is the global default. But
the fix is an owner call, because both available moves break a law:

* pin 43 → 45 — grows a ledger whose docstring says decrease-only;
* drain `--ds-color-bg-secondary` / `-tertiary` / `-input` — these ARE
  both-covered (all 3 verticals x 3 states, and DB-emitted via the appearance
  ground ladder), so the drain is mechanically safe, but it also requires
  editing `default-theme-neutral-derivation.test.ts`, which pins all three
  byte-identical.

I did not choose for W-A. The inventory stays at **43**; re-anchoring downward
was not possible because nothing was drained, and the staleness assertion
correctly refuses a pin that no longer matches reality.

Focal runs: `modern-tenant-value-free.test.ts` 4 passed / 1 failed (the above);
`src/foundation/tokens/__tests__/` **16 of 17 files pass, 129/130 tests**, the
single failure being that same pre-existing one.

## Step 7 — html.dark

No declaration added or removed. Two pinned literals live *exclusively* in the
`html.dark` block and nowhere else in the file:

| literal | channel | note |
|---|---|---|
| `#475569` | `--ds-color-neutral-400` | Tailwind slate-600 |
| `#f8fafc` | `--ds-color-neutral-900` | Tailwind slate-50 |

Both are the "third identity that belongs to nobody" of audit Finding 4, and
both are retire-eligible on the audit's own reasoning. Not touched — the mission
forbids mass-deletion, and the block is layered so it cannot outrank a tenant
anyway. `--ds-color-accent-live-bg` (`rgba(34,197,94,0.08)`) has **0** `var()`
readers repo-wide, but a `var()`-only census is the exact test W-A proved too
weak to retire on; it needs the 5-class census before anyone deletes it.

## Owner decision required

Neutralizing `default.css` is one coherent design decision and it does not
slice safely. The three sub-decisions:

1. **The semantic ramps** (success/warning/error/info, ~30 literals). They are
   not DB-covered at all. Neutralizing them changes every DB tenant. Either the
   appearance path grows a ramp derivation (mirroring `deriveTenantColorRamps`),
   or the ramps stay and the pin stays.
2. **The component twins** (~130 channels). Re-pointing them at their ramp
   anchor is the correct architecture and repaints bithire + evnto today. Needs
   a sighted review, not an acid.
3. **The W-A collision** (Step 6) — pin +2 against decrease-only, or drain the
   three ground channels and re-pin the freeze test. Fastest unblock for CI.

## Files

* read/analyzed: `packages/core/src/foundation/tokens/css/foundation/themes/default.css` (UNCHANGED)
* scratchpad: `…/scratchpad/wd/` — `wd-coverage.mjs`, `wd-coverage.json`,
  `wd-acid.mjs`, `acid-BEFORE/AFTER/DRILL.json`, `db-vocabulary.json`,
  `default.PREEDIT.css`, `default.HEAD.css`, `default.PATCHED.css` (dry-run only)
* temporary probe added to and REMOVED from
  `…/kernel/runtime/appearance/tests/wd-db-vocabulary.probe.test.ts`
