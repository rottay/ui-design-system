# F2.9 — the channel-liveness STOP NO-GO tail

Owner resolution R5 (`evidence/owner-decisions-2026-09-18/index.md`, rows
"F2.9 elevation-6" and "F2.9 xs/sm letter-spacing"; open item D.9).
Writer seat: Opus. Checkout `/Users/daniel/Developer/Rottay/ui-design-system`,
branch `main`. Every measurement below was taken against base HEAD `06958738e`.
Mid-lot the motion writer landed `8e6b7e57b` (110 files, milestone B fleet lot
1); it touches **none** of this lot's files, so the working tree rebases onto it
unchanged and the liveness numbers reproduce exactly on the new base
(universe 3118, `UNREAD_EMITTED_NO_KNOWN_ROUTE` 5, effect 41, 13 findings).
What §3/§5 call "the in-flight wave" is that commit; it is now HEAD, and the
attributions were measured while it was still uncommitted. Nothing was staged,
committed or pushed by this lot.

**Bounds honoured.** No family skin was edited (the motion rewire owns them) and
`scripts/check/theme/axis-difference/**` was not touched. Two temporary
mutations outside the write set (`derivation/chrome/box/index.ts`,
`derivation/typography/tier/index.ts`) were made to red a new drill and restored
byte-identically in the same command; both files are clean against their
intended state. Four generated bundles under `artifacts/generated/css/` were
written by an artifact regen and **restored to HEAD content** because that regen
absorbed the in-flight motion writer's uncommitted skins — see §4.

---

## 0. Answer in one screen

| question | answer |
| --- | --- |
| Is `--ds-elevation-6`'s productive route real? | **Yes, and it was already real at HEAD.** `surfaces.elevation-posture` → the elevation ladder's roster emission → `--ds-box-depth-2xl: var(--ds-elevation-6)` → `skin/box/index.css:88 box-shadow`. Both arms of that read land on rung 6. |
| Was the classifier blind? | **Yes — on provenance, not on the verdict.** `producerFor` knew only the tint ramp and the direct literal, so every roster/named-constant/template emission published `producer: null` / `emittedVia: null` while sitting in the emitted universe. 21 rows were affected; `--ds-elevation-6` was one. |
| Was there a pin to discharge? | **No pin was ever registered** — the 748cdf85c packet reported the row and refused to pin it (correct). What was stale is the *residual*: the row classifies `LIVE_MODERN_PAINTED` at HEAD, because `7a67243d8` (2026-09-18, cascade-wiring) wired the `2xl` read one day after the packet named it. The tail row is discharged by measurement, not by a table edit. |
| Do `--ds-type-tier-{xs,sm}-letter-spacing` have a reader? | **No.** Zero in `ui-design-system` (incl. showroom), `app-bithire`, `app-evnto`, `app-platform`. Retired. |
| Does retiring them move a pixel? | **No.** Chromium A/B across the three first-party verticals: every computed `letter-spacing` and `font-size` byte-identical; the only delta is the two channels going from `"0"` to absent. |
| Is the inherited route still effective? | **Yes, probed.** `xs`/`sm` headings paint `--ds-typography-heading-letter-spacing` to the pixel their own size implies, a type arm moves the role and both follow it, and `md` holds because the tier owns `md` and up. |

---

## 1. `--ds-elevation-6` — the measurement

### 1.1 The route, end to end

| step | owner | evidence |
| --- | --- | --- |
| decision | `surfaces.elevation-posture` (`appearance.general.surfaces.elevation`) | catalog row, `src/contracts/theme/runtime/catalog/index.ts:630` |
| posture table | `ELEVATION_PRESET.{flat,elevated}["--ds-elevation-6"]` | `compilers/kernel/foundation/css/appearance-posture/index.ts:98,108` |
| emission | `if (ELEVATION_CHANNELS.has(channel)) vars[channel] = value` over `ELEVATION_PRESET_CHANNELS` | `derivation/elevation/ladder/index.ts:33` |
| deriver-to-deriver | `vars["--ds-box-depth-2xl"] = "var(--ds-elevation-6)"` | `derivation/chrome/box/index.ts:59` |
| terminal paint | `box-shadow: var(--ds-box-depth-2xl, var(--ds-elevation-6))` | `engines/modern/skin/box/index.css:88` |

Both arms of the skin read resolve to rung 6, which is why the route is
productive without inventing a second reader.

### 1.2 The classifier repair

`producerFor` and `emittedVia` ignored `rosterEmission` entirely — the third
emission shape the keyed resolver already resolves and that `emittedNames`
already joins. The row therefore read `emitted: true, producer: null`.

A/B of the full gate over the real tree, before and after the repair:

```
classification changes: 0      provenance changes: 21   (all emittedVia 'keyed-resolved')
--ds-elevation-6  producer: null
               -> { kind: 'keyed-resolved', family: ['derived'],
                    sites: ['…/derivation/elevation/ladder/index.ts:33'] }
```

Zero verdicts moved: the repair buys provenance, never liveness. The 21 rows are
the breakpoint ramp (6), the z-index scale (11), the density factor, the two
motion dials and `--ds-elevation-6`. Note the side effect on the pinned
`--ds-breakpoint-xs` row: its WO-EVI-02 pin claims "nothing emits it and this
producer resolves the whole imported table"; the repair now prints that exact
site (`derivation/responsive/index.ts:71`), which makes the pin's own claim
legible. The pin is not this lot's and is left standing.

### 1.3 Depth causality, in a real browser

`Box.causality.integration.test.tsx` mounted only `shadow="md"` (rung 3), so the
top of the ladder was never probed. It now mounts a `2xl` box and:

- `describeCausality` requires `surfaces.elevation-posture` to move `depth2xl`
  as well as `depth`, holding `corner`, in all three verticals.
- a dedicated case measures the rung and the paint together, per arm:
  `elevated` → rung 6 `[32, 64]`, painted `[0, 32, 64, 0]` (built from the arm's
  own rung reading, not transcribed); `flat` → rung 6 `[2, 6]`, painted
  `[0, 2, 6, 0]`; and the paint is NOT rung 5's `[24, 48]`, so a silent fallback
  down the ladder cannot pass.

**Mutation drill.** Repointing `--ds-box-depth-2xl` at `var(--ds-elevation-5)`
reds the case (`expected […8, 16…] to not deeply equal […8, 16…]`, the base-arm
identity assertion). Restored.

### 1.4 Disposition

The row is `LIVE_MODERN_PAINTED` with a producer and a terminal, both published.
`CHANNEL_DISPOSITIONS` gains nothing and loses nothing — there was no pin. The
F2.9 first row is discharged by measurement; D.9's "owner proposal still awaits
a ruling" for `--ds-elevation-6` is stale and should be struck.

---

## 2. `--ds-type-tier-{xs,sm}-letter-spacing` — the census and the retirement

### 2.1 Census across the four repos

Authored source naming either channel, excluding generated snapshots:

| repo | files | readers |
| --- | --- | --- |
| `ui-design-system` (core + showroom) | 1 (the deriver that emitted them) | **0** |
| `app-bithire` | 0 | **0** |
| `app-evnto` | 0 | **0** |
| `app-platform` | 0 | **0** |

The gate agreed: both rows measured `UNREAD_EMITTED_NO_KNOWN_ROUTE`,
`reads.total: 0`, `consumerSites: []`.

They were not a dormant knob. The skin declares tier tracking only from `md` up
(`skin/typography/index.css`, "Tracking is declared only from `md` up, because
`xs`/`sm` declared none and inherit theirs"), and the value emitted was `0` — so
the only way the pair could ever have taken effect is by OVERRIDING the governed
heading role it was meant to defer to. A second tracking authority whose only
safe value is the one that does nothing.

### 2.2 The inherited route, proven before the retirement was trusted

Chromium probe, resting arm, per vertical:

| vertical | role `--ds-typography-heading-letter-spacing` | `xs` computed | `sm` computed | `md` computed | `md` tier channel |
| --- | --- | --- | --- | --- | --- |
| rottay | `-0.01em` | `-0.140625px` | `-0.15px` | `-0.16875px` | `-0.01em` |
| bithire | **`0.01em`** | **`0.124256px`** | **`0.13254px`** | **`-0.149108px`** | `-0.01em` |
| evnto | `-0.01em` | `-0.140625px` | `-0.15px` | `-0.16875px` | `-0.01em` |

bithire is the witness that makes this a proof rather than a coincidence: its
role tracking is POSITIVE while its `md` tier channel is negative, so the two
sources cannot be confused in a computed reading. `xs`/`sm` take the role;
`md` takes the tier.

Causality: a `typography.pairing: 'editorial'` arm moves the role (`-0.01em` →
`0`), `xs`/`sm` follow it (`-0.140625px` → `normal`), and `md` holds
(`-0.16875px` unchanged). Registered as
`Typography.causality.integration.test.tsx` → "leaves small-heading tracking on
the governed role in %s, with the tier owning md up", green in all three
verticals.

**Mutation drill.** Re-emitting `--ds-type-tier-xs-letter-spacing` as a
non-inert `0.5em` reds the case in all three verticals
(`expected '0.5em' to be ''`), which is the exact regression the retirement
forbids: a second tracking authority reappearing above the governed role.
Restored; the suite is 9/9 again.

### 2.3 Resting output preserved — A/B

The same probe run with the two emissions restored, then retired:

```
diff(before, after) across rottay | bithire | evnto
  "xs-tier": "0"  ->  ""
  "sm-tier": "0"  ->  ""
  (every computed letter-spacing and font-size byte-identical)
```

Six readings changed, all of them the retired channels themselves. Zero pixels.

### 2.4 The retirement drill

`packages/core/tests/architecture/retired-type-tier-zero-tracking/index.test.ts`,
in the house `retired-*` idiom: the producer emits neither name; the ramp is
narrowed rather than emptied (five tracking tiers and all seven leadings
survive); no authored source in the scanned repos names either channel; the
inherited route is still declared in the skin; and the scan is shown to be able
to fail against its own prose.

**Mutation drill.** Re-adding `vars["--ds-type-tier-xs-letter-spacing"] = "0"`
reds two legs (`emits neither name`, `names neither channel anywhere
productive`). Restored.

The drill deliberately does not read generated snapshots — see §4.

---

## 3. Gate evidence

Run in the working tree (which carries another writer's 108 uncommitted skin
files) and, where a verdict had to be attributed, re-run at clean HEAD in a
linked worktree.

| gate | HEAD | this lot | attribution |
| --- | --- | --- | --- |
| `channel-liveness` report | universe 3120, `UNREAD_EMITTED_NO_KNOWN_ROUTE` 7, effect 43 non-LIVE rows, 14 findings; **`STOP NO-GO: 2 … --ds-type-tier-{sm,xs}-letter-spacing`** (reproduced at clean HEAD) | universe 3118, `UNREAD` 5, effect 41, 13 findings; that row **gone** | **mine, −2**; `--ds-elevation-6` never was a finding |
| `channel-liveness --check-dispositions` | the same 2 unowned type-tier rows | 9 findings, none of them F2.9's | **mine**: the tail is off the ownership leg |
| `liveness` unit suite | 129/131 (2 red) | **131/133** (same 2 red) | the 2 reds are the chrome-deriver semantic-owner drift, reproduced at HEAD |
| `theme-parity:check` | `emitted-but-unconsumed.total=207` (baseline 205) + **new bucket `.type=2`** | `.total` back to **205**, `.type` bucket **gone** | **mine**: the `type=2` bucket WAS these two channels; a real parity regression drained |
| `hooks:check` | green | green (after `hooks:generate`) | **mine**: manifest delta is exactly the 2 names + their 2 counters, nothing else leaked |
| `lint:artifacts` | green | green (after `build:vertical-css`) | **mine**: facade artifact delta is exactly 6 deletions (2 names × 3 verticals) |
| `cascade-ratchet:check` | red, debt 2124, denominator 5821 | red, debt **2123**, denominator 5820 | pre-existing (the in-flight wave); mine is −1 |
| `csssource:check` | green | green | — |
| `contract:check` / `tenant-theme-fixtures:check` | green | green | — |
| `typecheck:tests` (`tsc -p tsconfig.tests.json`) | 3 errors | the same 3 errors | pre-existing: `IntersectionObserver` mocks in `tests/setup/index.ts` and `graphics/motion/react/runtime/reveal/tests`, both byte-identical to HEAD. **No file this lot writes produces a type error.** |
| `csspaint:check` | red (`--radius-field`, 2 × `single-entrypoint`) | identical | pre-existing, F2.11's row |
| `provenance-acceptance` → "keeps the shipped first-party variable counts" | red: rottay **2919** vs pin 2552 | red: rottay **2917** | pre-existing (+367 unanchored at HEAD); **my delta is exactly −2 per vertical** — §4 |
| `decisions-lit:check` | green | red (door digest moved) | **shared**: my deriver edit alone moves it (`602d2ad68bae` → `3fd5d24c305e`); the dirty tree moves it further — DT regen, §4 |
| `css-build --check` | n/a at HEAD (no `dist`) | red, 4 stale bundles | pre-existing: the in-flight skins make the bundles stale regardless; my share is 12 declarations — DT regen, §4 |

`Box.causality` (6/6), the whole typography family suite (11 files, 238/238) and
the new retirement drill (7/7) are green.

`src/infrastructure/compilers` runs **3203/3209** in this tree — 3 files, 6
tests red. Five of the six — `adapters` → `classic/surfaces.elevation-posture:
the pinned gap equals the measured gap` (this is F2.5's cell) and `emission` →
the three `byte-identical to the reference grammar` cases plus `admits every
compiled channel of every first-party theme` — **reproduce identically at clean
HEAD** (5 failed / 288 passed on those two files in the worktree); the emission
guard's dropped set is the in-flight chrome families
(`--ds-action-dock-safe-area-*`, `--ds-workspace-shell-orbital-mask`). The sixth
is the channel-count pin above, where this lot's delta is the named −2.

---

## 4. For the DT's serialized regen window

These are generated outputs that still carry the two retired declarations. They
paint nothing — a declaration nobody reads is inert — and re-deriving them here
would have absorbed the in-flight motion writer's uncommitted skins, so they are
named rather than written.

| file | retired declarations | regen command |
| --- | --- | --- |
| `packages/core/artifacts/generated/css/all-verticals/index.css` | 6 | `build:vertical-css` |
| `packages/core/artifacts/generated/css/verticals/{rottay,bithire,evnto}/index.css` | 2 each | `build:vertical-css` |
| `packages/core/artifacts/generated/theme-graph/{nodes,edges}.json` | present | `ds:derive` |
| `packages/core/scripts/generate/tokens/customization/preservation/manifest/index.json` | 2 | the customization catalog generator |
| `packages/core/scripts/generate/tokens/customization/surface/report/index.json` | 2 | the customization surface generator |
| `scripts/check/decisions-lit/evidence/index.json` | — (door digest only) | `pnpm --filter @rottay/design-system run decisions-lit` |

**One ledger row to append when the first-party channel-count pin is
re-anchored** (`provenance-acceptance.test.ts`, "keeps the shipped first-party
variable counts"). The pin is already `+367` behind at HEAD, so it is not this
lot's to move; the row this lot owns, in the ledger's own format, is:

```
 *      +0/-2    +0/-2    +0/-2  <sha>  --ds-type-tier-{xs,sm}-letter-spacing retired, the two zero-only tracking emissions with no reader in any of the four repos; small headings keep the governed heading role (F2.9)
```

Measured: rottay 2919 → 2917 with only this lot applied. The ledger already
carries the same shape for `ba33315db  --ds-breakpoint-xs retired, the ladder's
unread floor`.

**Evidence of the hazard, recorded deliberately.** Running `build:vertical-css`
in this tree regenerated the four bundles with **1976 insertions / 2048
deletions**, almost all of them the other writer's `--ds-motion-*` rewire. The
four files were restored to HEAD content with `git show HEAD:<path> > <path>`
(no `checkout`/`restore`). The facade artifacts under
`src/foundation/tokens/css/facade/artifacts/` were NOT reverted, because their
regen delta was exactly the 6 lines this lot owns.

`artifacts/quality/programs/modern-rescue/R1/channel-liveness.json` has still
never been written in this checkout; `--write` refuses while the analysis is red,
which it is for other owners' rows (§5).

---

## 5. What stays red, and whose it is

Not this lot's, reproduced at HEAD, listed so nothing is read as drained:

- `--ds-app-shell-navigation-drawer-body-padding` — `READ_UNPROVEN`, unregistered.
- `--ds-workspace-shell-particle-{primary,secondary}` — `READ_NO_PRODUCTIVE_TERMINAL`, unregistered.
- five **discharged** `--ds-breakpoint-{sm,md,lg,xl,2xl}` pins and the
  `--ds-z-index-base` structural pin: their channels now classify LIVE, so the
  table owes a shrink. Reproduced at **clean HEAD in a linked worktree**, so
  this is committed work, not the in-flight wave. Deliberately NOT deleted here:
  the breakpoint pin's own discharge condition names a graph change ("the graph
  counts a deriver-to-deriver chain as a productive route") that did **not**
  happen — the rows went LIVE by some other mechanism, and discharging a pin on
  a different mechanism than it predicted is its owning lane's attribution to
  make, not a silent delete by this lot. Likewise `z-index-single-scale`: "a
  band that gained a reader is no longer a structural constant" is a ruling on
  the invariant, not a table edit.
- `unclassified output: 342` and `unknown family: 31` — the chrome families
  (app-shell, search-command-bar, shortcuts-overlay, command-palette,
  scope-switcher, workspace-shell, section-card, page-shell, action-dock) whose
  namespaces the semantic-owner alternation has not caught up with.
- three `unresolved emission pattern` rows (`axes`, `typography/scale` ×2).

---

## 6. One finding handed on, not acted on

The catalog row `surfaces.elevation-posture` declares

```ts
produces: { channels: ["--ds-elevation-1", "--ds-elevation-2", "--ds-elevation-3"], … }
```

while `ELEVATION_PRESET` states **all seven** roles (`--ds-elevation-0..6`) for
both `flat` and `elevated`, and §1.3 above now measures rung 6 moving under that
exact decision in a browser. The declared produce set therefore under-declares
by four channels. It was left alone deliberately: the catalog is outside this
lot's write set, `produces.channels` feeds the decision-to-family fan-out
denominators, and widening it is a measurement the catalog lane owns. Recorded
here so it is not lost — the row's own posture table is the evidence, and the
`Box` causality case is the proof for rung 6.

---

## 7. Files

**Instrument**
- `packages/core/scripts/check/tokens/cascade/channels/liveness/index.mjs` — `producerFor` gains the keyed/roster shape; `emittedVia` gains `'keyed-resolved'`.
- `packages/core/scripts/check/tokens/cascade/channels/liveness/index.test.mjs` — two cases: the fixture drill over the three emission shapes, and the real-tree `--ds-elevation-6` route (producer end + terminal end).

**Source**
- `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/typography/tier/index.ts` — the two zero-only emissions retired; the fileoverview states why tracking starts at `md`.

**Tests**
- `packages/core/src/components/primitives/layout/box/tests/Box.causality.integration.test.tsx` — a `2xl` box, `depth2xl` in the causality spec, and the top-rung drill.
- `packages/core/src/components/primitives/display/typography/tests/Typography.causality.integration.test.tsx` — the two retired targets dropped from the ramp probe; the inherited-route case added.
- `packages/core/tests/architecture/retired-type-tier-zero-tracking/index.test.ts` — new retirement drill.

**Generated, regenerated because the delta was exactly this lot's**
- `packages/core/contracts/css/hooks/index.json`
- `packages/core/src/foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/index.css`
