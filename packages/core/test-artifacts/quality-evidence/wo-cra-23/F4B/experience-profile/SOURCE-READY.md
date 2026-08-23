# F4B control 4/20 `experience.profile` — SOURCE_READY

Verdict: **SOURCE_READY**. `COMPUTED_VERIFIED` on real measurement, never SIGHTED.
Roadmap ledger **3/20 -> 4/20**, written into the canonical doc
`docs/ROADMAP-EJECUCION-2026-08-19.md` (F4B progress row + a full
`experience.profile` seat placed after the `shape.radius-scale` one). `staged=0`,
no commit, no push, no stash.

> **Correction.** An earlier draft of this file claimed the ledger was "derived,
> not stored". That was wrong: the canonical roadmap carries the counter as a
> literal, and it still read `3/20` after the manifests were already at four. The
> doc is the ledger; the manifest census is not a substitute for it.

- HEAD `48fa4f20a95228bec3fe14b76d9fae979869630d` (unchanged)
- Mapping sha256 `9a9e2f257f6025f531e9b81f7534545f21a3a95344b985c9070363f392407cda` (owner-confirmed)
- Node **v22.17.0** for every build, run and focal (machine default is v25.2.1; PATH was pinned)
- Packet ran in two phases: a preflight that ended in **STOP**, and this expanded
  packet authorized by the DT after that STOP. The original STOP memo is retained
  verbatim beside this file as `PREFLIGHT-STOP-2026-08-23.md`.

## 1. Scoreboard, stated before the narrative

| | planned by the DT | delivered |
|---|---|---|
| positive receipts for `experience.profile` | 5 | **4** |
| non-receipted measured scenarios | 1 (`DESIGNED_NULL`) | **2** (`DESIGNED_NULL` + `DIVERGENCE`) |
| previously-closed receipts re-emitted | 20 | **20** |
| total fresh receipts | 25 | **24** |

`roundId` is chronological and was corrected inside the packet: `spacing.rhythm`
and `surfaces.effect-intensity` stay **R2** (not re-emitted in the correction pass),
`shape.radius-scale` is **R3** (its prior closure restored), `experience.profile`
is **R4** as the fourth packet.

The fifth positive (`bithire` × `management-editorial`) **did not pass
`static=DB`** and is therefore not receipted, per the DT's own law ("si cualquiera
de los 5 positivos no logra ... static=DB real, STOP sin sobreafirmar"). It is
retained as a measured artifact and adjudicated in §5. **24/24, not 25/25** — the
difference is a finding, not an omission.

## 2. What the preflight refuted, and what the DT then authorized

The preflight found the control mechanically unreachable: `ingressValueForStop`
supported `closed-enum` and `bounded` only, and `profile-id` was named in an
existing **negative drill** asserting it must fail closed. It also found that the
declared payload painted exactly one property on the only available fixture, and
that no direct-read control fixture existed. That is why the packet stopped
rather than producing a green run on a control the instrument could not lower.

The DT then authorized the expanded packet. Two of its instructions were changed
by measurement during execution, both with the DT's explicit ruling:

- **Instruction B was reverted.** Adding `--ds-table-header-letter-spacing` and
  `--ds-table-header-text-transform` to `derivedChannels` was ordered to supply a
  direct-read control fixture. Measurement showed it does the opposite: `directControlFixtureIds`
  requires **one target to read EVERY declared channel**, so widening the declared
  set makes a control fixture *harder*, not easier — and the two added channels were
  the sole source of static/DB divergence on rottay (both stops) and bithire, because
  rottay and bithire **author** them in their compiled artifacts (`* 0.75` and
  `* 0.8125` respectively) while evnto does not. The DB patch correctly loses to an
  authored channel; the static block outranks it. Reverting restored `0` differing
  rows. **Net effect: the registry is byte-identical to HEAD and 19 control manifests
  were NOT repinned.**
- **A reproducible FALSE RED in the unhydrated guard was fixed inside fixtures.**
  `color remains fixed` is `every-measured-target`, so it injects `background-color`
  into *every* target's plan. On a bare `<div>` that longhand is legitimately at its
  initial value, so `token-readout` — a perfectly hydrated element whose custom
  properties demonstrably moved — was reported unhydrated. The same fired on
  `card-modern-md/title` in the mutation phase, because the editorial stop legitimately
  drives `letter-spacing` to `normal`. Control experiment: the identical fixture pair
  under `spacing.rhythm`'s 8-entry negative set produces **0** guard failures, which
  isolates the cause to the negative-control set rather than the fixtures. Fixed by
  declaring `border-top-style` on both targets — set to `solid` by the DS base layer,
  decidable, non-initial, and not a channel of any control. **No false negative-control
  was declared to make a guard pass.**

## 3. The five declared channels, and which of them actually paint

`lowerStop` keeps only `declaredOutputs.channels`, so the causal payload is exactly
these five. Measured on `card-modern-md`:

| declared channel | paints here? |
|---|---|
| `--ds-experience-profile` | no — provenance marker; `card.css` never reads it |
| `--ds-letter-spacing-heading` | **yes** — `[data-part='title']` `letter-spacing` (card.css:521) |
| `--ds-edge-standard-width` | no — the `elevated` variant reads the hairline channel, and both stops emit `1px` = baseline |
| `--ds-material-canvas-texture` | no — a `semantic-surface.css` channel; and emitted only by the editorial stop (`motif:'none'` expands to `{}`) |
| `--ds-elevation-lift-strength` | **yes** — `[data-part='root']` `background-image` (card.css:73,147) |

The `title` part did not exist on the fixture before this packet. It was added by
rendering the **real** `ModernCard` with `title="Card title"` and pasting
`renderToStaticMarkup` output, so the roster drift test covers it exactly like the
root (19/19 green).

## 4. The four receipted scenarios

All four: `self-check=harness-live`, `pass=true`, `ingressEquivalence: identical
(0 differing rows)`, `restore.exact=true`, `negativeControls.held=true`, both
ingress doors on ONE scene, both themes.

**Painted witness — `card-modern-md/title` `letter-spacing`, 8 of 8 cells:**

| vertical | technical stop | editorial stop |
|---|---|---|
| rottay | `-0.196875px` → **`0.13125px`** (both themes) | `-0.196875px` → **`normal`** (both themes) |
| evnto | `-0.3px` → **`0.15px`** (both themes) | `-0.3px` → **`normal`** (both themes) |

**Second painted witness — `card-modern-md/root` `background-image`, 6 of 8 cells.**
The editorial stop (lift `2`) moves it in both themes; the technical stop (lift `0`)
moves it in **dark only**. That is not a gap: light themes already resolve
`--ds-elevation-lift-strength` to `0`, so the technical stop is a **true no-op** for
that axis there. Stated explicitly so a later reader does not record it as an inert
channel.

**Direct channel:** `token-readout` reads all five declared channels and is therefore
the direct-read control fixture. `--ds-letter-spacing-heading` moved on both arms in
all four scenarios (rottay `-0.025em` → `0.01em` technical, → `0` editorial).

**Note on the editorial title value.** `--ds-letter-spacing-heading: 0` is substituted
unitless and is invalid at computed-value time, so the painted result is the initial
value `normal`. The movement is real, reversible and identical on both doors; it is
only the *hydration guard* that cannot decide such a target from its longhands, which
is what the `border-top-style` witness exists for.

## 5. The two non-receipted scenarios, and why each is honest

### `bithire-technical.DESIGNED-NULL.json` — a structural identity

`brand-themes/bithire/index.ts:3190` already declares
`experienceProfile: "rottay/bithire-technical@1"`. A bithire tenant selecting that
stop selects the profile the vertical **already has**. Measured and retained; never
receipted; must not be read as an inert-control finding.

### `bithire-editorial.DIVERGENCE.json` — a real static/DB divergence, reproduced twice

`harness-live`, restore exact, negatives held — and `ingressEquivalence: DIVERGES
(3 rows)`. Two distinct causes, both confirmed at source:

1. **Specificity shadowing, dark only (2 rows).** bithire's artifact declares
   `--ds-letter-spacing-heading` twice: at base tenant specificity
   (`artifacts/bithire/index.css:644`, `-0.025em`) and again in a dark block whose
   selector carries an extra attribute/class —
   `:is(html[data-tenant='bithire'], …)[data-theme='dark'], …​.dark`
   (`:1496`, `-0.01em`). The static ingress block lands behind the **base** selector,
   so bithire's dark block outranks it and the static door is **inert in dark**; the
   DB door writes inline on `documentElement` and always wins. The same two rows appear
   on the technical stop, so this is a property of the vertical's cascade, not of a stop.
2. **Arm asymmetry, light (1 row).** `--ds-material-canvas-texture` moves on static and
   not on DB, because `compileTenantThemeConfig` emits only 3 of the 5 declared channels
   for bithire/editorial: the profile expansion **loses to a channel the vertical baseline
   already authors**, which is the control's own declared `defaultBehavior`. The static
   lowering has no vertical baseline to lose to, so it emits.

Both are recorded as `knownDefects` on the control with remediation notes. Neither is
a defect *of* `experience.profile`; both are properties of the bithire artifact and of
the door asymmetry, and both are above a single-control packet.

## 6. Exact write-set

**Harness (authorized: ingress + tests)**
- `src/tooling/resolution-probe/runtime/ingress/index.mjs` — `profile-id` branch in
  `ingressValueForStop`, fail-closed on a non-string id, on an absent/empty
  `calibration.catalog`, and on an id outside that catalog. The closed set is the
  **registry** (`calibration.catalog`), never `domain.enumValues`, which is empty by
  contract for this kind.
- `src/tooling/resolution-probe/runtime/ingress/tests/index.test.mjs` — `'profile-id'`
  removed from the unsupported-kind drill **only**; `token-map`, `color-set`, `scale`
  and `undefined` still refuse. Four new drills: verbatim lowering at both doors, id
  outside the catalog refused, absent/empty catalog refused, non-string id refused.

**Fixtures**
- `src/tooling/resolution-probe/foundation/roster/fixtures.json` — `card-modern-md`
  gains a real header/title (rendered from `ModernCard`) and a `title` target; both
  measured targets gain `border-top-style` as a hydration witness; `token-readout`
  gains the five declared channels so it qualifies as the direct-read control fixture.
- `src/tooling/resolution-probe/foundation/roster/tests/index.test.tsx` — the
  `card-modern-md` render gains `title="Card title"` so drift cover stays exact.

**Manifests**
- `manifest/controls/experience.profile.json` — calibration only (stops, sourceBindings,
  parity/restore evidence ids, negative controls + scope note, measuredResult, three
  knownDefects, nextAction).
- `manifest/families/primitive/display/card.json` — the `experience.profile` cell only:
  `MUST_NOT_REACH` → **`MUST_REACH`**, with the refutation reason, source bindings,
  four evidence ids and an explicit scope note.
- `manifest/index.json` — regenerated by the canonical producer (`--sync`).

**Roadmap (canonical ledger)**
- `docs/ROADMAP-EJECUCION-2026-08-19.md` — the F4B progress row `3/20` -> `4/20`
  (four controls named, receipts stated as `8+6+6+4 = 24` with their round ids
  R2/R2/R3/R4, the two non-receipted artifacts named, **16** remaining `UNKNOWN`),
  plus a complete `experience.profile` seat inserted after the `shape.radius-scale`
  seat. Diff is **one line removed** (the old F4B row) and 183 added; all three prior
  seats are present exactly once and byte-intact, `SIGHTED_ACCEPTED` appears only as
  "no se reclama", and the only `25` in the seat is the explicit negation
  "24/24 receipts frescos, NO 25/25".

**Registry: NOT modified.** `capabilities/index.ts` is byte-identical to HEAD, so the
20-manifest repin the DT pre-authorized did **not** happen and is not owed.

**Evidence** — `test-artifacts/quality-evidence/wo-cra-23/F4B/experience-profile/`:
4 receipt pairs, 2 non-receipted artifacts, this file, and `PREFLIGHT-STOP-2026-08-23.md`.

## 7. Tests

| check | result |
|---|---|
| `runtime/ingress` drills | **37 pass / 0 fail** (33 pre-existing + 4 new) |
| `foundation/causality` | 17 / 0 |
| `foundation/guards` | 12 / 0 |
| `foundation/negative-controls` | 20 / 0 |
| `composition/run` | 19 / 0 |
| `composition/receipt` | 11 pass / **1 fail — INHERITED** |
| roster drift (`vitest --project unit`) | **19 / 19** |
| `tsc --noEmit` | **exit 0, clean** |

**Inherited red, recorded by identity, not chased** (DT: "no persigas rojos
heredados"): `composition/receipt/tests/index.test.mjs:197` — *"negative drill: the
producer may not be the sighted approver"*. Verified red at HEAD `48fa4f20a` with a
clean worktree before any edit of mine. It is a fence that is currently not fencing:
a receipt naming the sighted approver as producer would not be rejected today.

**Also inherited:** `node manifest/generator/index.mjs --check` reports **24
`spacing.rhythm` family-cell failures** (evidence-id form, `mechanism`,
`internalChannels`) that are byte-identical at HEAD and untouched by this packet.

**The gate is strictly better than HEAD**, and the numbers say so rather than
leaving a reader to infer it:

| | HEAD `48fa4f20a` | this tree |
|---|---|---|
| total `--check` FAIL lines | 36 | **24** |
| stale-digest failures | 12 | **0** |
| `experience.profile` failures | 0 (cell was `UNKNOWN`) | **0** (cell is `MUST_REACH` + `COMPUTED_VERIFIED`) |
| inherited `spacing.rhythm` failures | 24 | 24 (untouched) |

### Receipt freshness, verified by content

All **24** receipts re-verified after the final tree was frozen, using the
instrument's own `verifyReceipt` (with `loadProgramContracts`) **and**
`artifactStillMatches`:

```
RECEIPTS: 24 | VALID+FRESH: 24 | invalid: 0
```

**No stale residual.** Getting there required understanding a circularity worth
recording: a receipt's `sourceFiles` includes the control and family manifests, so
**every manifest edit stales every receipt that names it**. Receipts must therefore
be emitted LAST, after the final manifest byte is written — the order used here.

## 7b. A metadata regression I introduced, caught, and corrected

The first re-emission pass ran `--round-id R2` for all 20 previously-closed
receipts. That was wrong for `shape.radius-scale`, which was **R3** at
`48fa4f20a` — leaving it would have contradicted its own seat ("R3 el tercero").
Caught by diffing `roundId` against HEAD before closing, and corrected on the DT's
order: the 6 `shape.radius-scale` receipts re-emitted as **R3**, the 4
`experience.profile` receipts as **R4**; `spacing.rhythm` and
`surfaces.effect-intensity` were deliberately **not** re-emitted and stay **R2**.
Same scenarios, same binds, same frozen tree. Re-validated after: **24/24
VALID+FRESH**, and the round-id census per lane is R2 / R2 / R3 / R4.

## 8. Debt this packet did NOT pay

- **254 of the 255 `experience.profile` family cells** still carry the conflated
  `MUST_NOT_REACH` reason ("nobody reads `--ds-experience-profile`" and its `Idem`
  chains). Only `primitive/display/card` was re-adjudicated, and only because it now
  has a painted witness. This packet is **not** evidence about the other 254 in either
  direction. Each needs its own witness; a bulk flip would repeat the original error
  in the opposite direction.
- The two bithire cascade/arm findings in §5.
- The guard over-strictness described in §2 is worked around at fixture level, not
  fixed at source. The structural fix — an `every-measured-target`-injected property
  should not by itself make a target decidable — lives in `foundation/guards`, outside
  this packet's authorized paths.

- Card's `anatomy.propertyGroups` owns no type-metrics group, so the title chain is
  evidenced through `computedProperties` + `internalChannels` rather than through a
  group. Extending `anatomy` is a separate reviewed owner.
