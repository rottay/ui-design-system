# F4B — control 4/20 `experience.profile` — PREFLIGHT VERDICT

**VERDICT: STOP**

Agent: Claude Opus, sole writer/runner of the packet. **No source file was
edited.** Worktree verified clean at the end (`git status --porcelain` empty).
No stash, no stage, no commit, no push. No subagents.

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system`
- HEAD: `48fa4f20a95228bec3fe14b76d9fae979869630d` (matches expected)
- Mapping read: `/private/tmp/f4b-control-4-sonnet.md`,
  SHA256 `9a9e2f257f6025f531e9b81f7534545f21a3a95344b985c9070363f392407cda` (matches expected)
- Node: **v22.17.0 via nvm** (`/Users/daniel/.nvm/versions/node/v22.17.0/bin/node`).
  Divergence recorded: the default `node` on PATH is homebrew **v25.2.1**. Every
  command below was run with PATH pinned to 22.17.0. A run taken with the bare
  `node` on this machine is NOT the expected environment.
- `dist/` freshness: **ok=true, failures=[]** (`assertDistFresh`), so the two
  compiled ingress arms were importable and were exercised for real.

The packet is stopped at binding order step (2). Step (3) was never entered, so
**nothing in the write-set was touched**: `manifest/controls/experience.profile.json`,
`manifest/families/primitive/display/card.json`, the roadmap counter and the
`experience-profile` evidence directory are all untouched at HEAD. Consequently
**all 20 closed receipts remain fresh** (6 shape-radius + 6 effect-intensity +
8 spacing) and no re-emission is owed.

---

## 1. Why STOP: four blockers, three of them measured

### BLOCKER A — the instrument mechanically refuses this control (absolute)

`experience.profile` declares `domain.kind: "profile-id"`. The harness's
`ingressValueForStop`
(`packages/core/src/tooling/resolution-probe/runtime/ingress/index.mjs:387`)
only knows `closed-enum` and `bounded`, and **fails closed on everything else**.

Observed, not inferred — the causal command was actually invoked against a
scratchpad copy of the control manifest with `normalizedStops` populated:

```
resolution-probe: Error: resolution-probe: experience.profile declares domain kind
"profile-id", and this harness only knows how to write a closed-enum stop id or a
bounded stop value at an ingress path. Refusing to lower a stop on a remembered convention.
    at ingressValueForStop (.../runtime/ingress/index.mjs:387:9)
    at buildIngressInput (.../runtime/ingress/index.mjs:322:24)
    at lowerStop (.../runtime/ingress/index.mjs:537:17)
```

This is not an oversight to route around. `profile-id` is named in an **existing
negative drill** that asserts it must fail closed:

`runtime/ingress/tests/index.test.mjs:588`
```js
test('negative drill: a domain kind this harness cannot write fails closed', () => {
  for (const kind of ['profile-id', 'token-map', 'color-set', 'scale', undefined]) { ... }
```

So teaching the harness `profile-id` means **editing an owned instrument file and
weakening an existing fence**. The cost is measured, not estimated:

- `ownedSourceFiles()` returns 19 files and **includes**
  `packages/core/src/tooling/resolution-probe/runtime/ingress/index.mjs`.
- **All 20 closed receipts list that exact file in their `sourceFiles`** (verified
  by reading every `*.receipt.json`: 6 shape-radius @54 files, 6 effect-intensity
  @54, 8 spacing @48–51).

Therefore any fix to Blocker A **stales all 20 closed receipts**, including the 8
spacing receipts the brief explicitly required to stay fresh. The brief's cost
model — "only Card edits stale the 12" — does not survive this control.

**`recipe-profile` (the other `profile-id` control) is blocked identically.** This
is a class blocker over 2 of the 20 controls, not a one-off.

### BLOCKER B — root does not reach: the declared payload paints one property

`lowerStop` keeps **only** `declaredOutputs.channels`. So the causal payload for
this control is exactly its 5 declared channels — nothing else, no matter what the
expansion really emits. Against the existing `card-modern-md` fixture (target
`root`, unmodified), those 5 resolve to:

| declared channel | paints on `card-modern-md/root`? |
|---|---|
| `--ds-experience-profile` | no — provenance marker, `card.css` never reads it |
| `--ds-letter-spacing-heading` | no — `[data-part='title']` only; the fixture renders no title |
| `--ds-edge-standard-width` | no — the `elevated` variant reads `--ds-edge-hairline-width`; and both stops emit `1px`, equal to baseline |
| `--ds-material-canvas-texture` | no — a `semantic-surface.css`/`patterns.css` channel |
| `--ds-elevation-lift-strength` | **yes** — via `background-image` |

One painted witness, driven by one channel. Measured with `dial --dial-target root`
carrying **exactly the declared payload per stop**, all 3 verticals × 2 themes:

| stop | painted rows moved | cells with movement |
|---|---|---|
| `rottay/bithire-technical@1` | `background-image` only | **2 of 6** — rottay/dark, evnto/dark only |
| `rottay/management-editorial@1` | `background-image` only | **6 of 6** |

The technical stop is inert in rottay/light, evnto/light and both bithire themes.
That inertness is **true, not instrumental**: `--ds-elevation-lift-strength`
already resolves to 0 in light themes, and the technical stop sets 0. The stop is
a genuine no-op for that axis there.

`border-top-width` **never moved in any cell, under any stop** — the edge chain is
1px on both sides of the mutation. The brief's two preferred root properties
therefore reduce to one, and that one covers 2/6 of the technical scenarios.

For the record, the same dial carrying the **full 28/30-channel expansion**
(not legal as a causal payload, run only to bound the ceiling) moved 26 and 30
rows respectively and reported `controls: harness-live`. The extra painted
movement is almost entirely `border-*-radius` from the coupled `--ds-radius-scale`
field default (0.85 / 1.15) — which is **not a declared channel**, is the closed
`shape.radius-scale` control's own painted witness, and would conflate two
controls if used here.

### BLOCKER C — this control has no direct-read control fixture

`runCausalProbe` derives `controlFixtures` via
`directControlFixtureIds({fixtures, channels: declaredOutputs.channels})`.
`token-readout` reads 25 properties and **none of the 5 declared channels**
(verified by enumeration). So the set resolves empty and, by the harness's own law,
every causal run for this control is `harness-suspect` — which **voids every inert
verdict in the same artifact**. Both declared-payload dials above did in fact print:

```
controls: harness-suspect — NO control moved. ... every inert verdict in this artifact is void.
```

Without extending `token-readout` (forbidden by the brief), a green run is not
obtainable and a red run proves nothing.

**There is a clean fix that stays inside the write-set**, and it is the single most
useful thing in this memo: `--ds-table-header-letter-spacing` and
`--ds-table-header-text-transform` are **already read by `token-readout`** and
**both move on both stops** (technical `0.05em`/`uppercase`; editorial
`0.01em`/`none`). Adding them to `declaredOutputs.channels` would give this control
a real direct-read control fixture with **no `fixtures.json` edit at all**.
Checked: neither is a `root-catalog.json` root, so the `root-exposure-gate`
`internal-head` tripwire is not armed by the addition. The cost is that
`declaredOutputs.channels` would then differ from the registry's `derivedChannels`
(`capabilities/index.ts:375-381`); no gate currently verifies that pairing
(`registryDigest` is read by `manifest/generator/index.mjs` only, never asserted),
so this is a DT adjudication, not a mechanical failure. **I did not make this edit.**

### BLOCKER D — 1 of the 6 minimum scenarios is a structural null

`src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts:3190`
declares `experienceProfile: "rottay/bithire-technical@1"`.

**BitHire's code-owned baseline already IS the technical profile.** A tenant
selecting it on bithire selects the identity, so the DB patch carries no diff.
Measured at the compiler, declared channels emitted per arm (out of 5):

| vertical | arm | technical | editorial |
|---|---|---|---|
| rottay | static | 4/5 | 5/5 |
| rottay | db | 4/5 | 5/5 |
| bithire | static | 4/5 | 5/5 |
| **bithire** | **db** | **1/5** | **3/5** |
| evnto | static | 4/5 | 5/5 |
| evnto | db | 4/5 | 5/5 |

On `bithire`/`db`/technical the compiler emits **neither `--ds-experience-profile`
nor `--ds-edge-standard-width` nor `--ds-elevation-lift-strength`** — only
`--ds-letter-spacing-heading`. `normalizedAppearance.general.experienceProfile` is
nonetheless correctly set to the requested id, so the selection is accepted and
the suppression is downstream, in patch resolution against the vertical baseline
(the compiler says so in its own comment at
`compilers/composition/tenant-theme/index.ts:1886-1893`: "a field the vertical
baseline already authors is only overridden by a field the PATCH carries").

This is **by design, not a defect** — but it means the `bithire × technical`
scenario can never show causal movement, and a static/DB parity assertion on
bithire would compare a 4/5 static arm against a 1/5 DB arm. Two of the six
minimum scenarios are structurally compromised before any browser opens.

---

## 2. Preflight items the brief ordered, and their answers

**(1a) Both literal doors — VERIFIED LIVE.** Both were exercised against the real
compiled compilers from a fresh `dist/`, read-only, from the scratchpad.

- static `expressive.experienceProfile` → `compileBrandTheme` → emits 4/5 (technical)
  and 5/5 (editorial) declared channels, identically for all three verticals
  (144/145 vars, 28/30 moved vs baseline). The static arm carries **no vertical
  baseline** — `tenantSlug` only builds the selector.
- DB `appearance.general.experienceProfile` → `compileTenantThemeConfig`
  (`dist/server.js`, `TENANT_THEME_SCHEMA_VERSION = 1`) → resolves the code-owned
  vertical envelope, so its emission **is** vertical-dependent (table above).

Both doors are literal and walkable. The mapping was right about this. The doors
are **not** the blocker; the instrument and the fixture are.

**(1b) BitHire shadowing — CONFIRMED, and it is real.** Sonnet flagged this as
unverified risk #1. Counts of flat tenant-scope declarations in each vertical's
compiled artifact (`src/foundation/tokens/css/facade/artifacts/<v>/index.css`):

| channel | rottay | bithire | evnto |
|---|---|---|---|
| `--ds-elevation-lift-strength` | 0 | **1** (`: 0`, line 462) | 0 |
| `--ds-edge-standard-width` | 0 | **1** (`: 1px`, line 457) | 0 |
| `--ds-edge-hairline-width` | 0 | **1** | 0 |
| `--ds-material-canvas-texture` | 0 | **2** | 0 |
| `--ds-experience-profile` | 0 | **1** | 0 |
| `--ds-letter-spacing-heading` | 1 | **2** | 1 |

BitHire flat-declares every channel this control needs; rottay and evnto declare
none of the elevation/edge ones. This is the same second-emitter shape that cost
`shape.radius-scale` two of eighteen painted rows. The DB arm (root inline)
outranks it; **the static arm lands at the same specificity as the artifact
block**, so on bithire the static arm's result depends on source order. That is an
unresolved parity hazard, and it is why the bithire dial cells did move for the
editorial stop (the dial writes inline, not as a stylesheet block) while a static
arm might not.

**(2) The 6 minimum scenarios — NOT RUN.** Blocked at Blocker A; zero of six
executed. No fixture was extended, no `fixtures.json` or `token-readout` edit was
made, in accordance with the brief.

**(3) Not entered.**

**Negative controls.** `color-fixed` is usable as-is and symmetric across both
stops (verified against `negative-controls/vocabulary.json`); `color`,
`background-color` and `border-top-color` are all already measured by
`card-modern-md/root`, and no dial moved any of them. `motion-fixed` is
**per-stop only** — editorial sets `--ds-motion-intensity: 0.7` and
`--ds-motion-duration-scale: 1.1` as field defaults — so declaring it control-wide
would fail the editorial scenarios by design. Sonnet's risk #3 is confirmed
correct. `--ds-material-canvas-texture` is emitted **only** by editorial
(`motif:'none'` expands to `{}`), confirming the predicted structural asymmetry;
this is expected, not an inert-channel signal.

---

## 3. Tests run, and inherited red recorded by identity

Focal causal-mechanics drills at HEAD, PATH pinned to Node 22.17.0:

| drill | result |
|---|---|
| `foundation/causality/tests` | pass 17, fail 0 |
| `foundation/guards/tests` | pass 12, fail 0 |
| `foundation/negative-controls/tests` | pass 20, fail 0 |
| `runtime/ingress/tests` | pass 33, fail 0 |
| `composition/run/tests` | pass 19, fail 0 |
| `composition/receipt/tests` | pass 11, **fail 1** |

**Inherited red, by identity — not chased, not fixed:**
`composition/receipt/tests/index.test.mjs:197` — *"negative drill: the producer may
not be the sighted approver"*. Assertion
`result.failures.some(m => /must not be the sighted approver/.test(m))` evaluated
falsy. Pre-existing at HEAD `48fa4f20a` with a clean worktree and zero edits from
me, so it is definitionally not caused by this packet. It is a receipt
producer/approver separation fence, unrelated to `experience.profile`. Flagged for
the DT because it is a **fence that is currently not fencing** — a receipt naming
the sighted approver as producer would not be rejected today.

No global suites were run; no global reds were chased.

---

## 4. Ledger — real numbers, no over-claim

- Controls closed before this packet: **3 of 20** (shape.radius-scale, spacing.rhythm,
  surfaces.effect-intensity). **Unchanged: still 3/20.** The roadmap counter was
  **not** advanced to 4/20.
- Causal scenarios executed for `experience.profile`: **0 of 6**.
- Receipts emitted: **0**. Receipts staled: **0**. All 20 closed receipts remain
  fresh and valid.
- Doors verified live at compiler level: **2 of 2**.
- Declared channels that paint on the only available fixture: **1 of 5**.
- Vertical×theme cells where the technical stop moves a painted property with the
  declared payload: **2 of 6**. Editorial: **6 of 6**.
- Assessment state of `experience.profile`: **UNKNOWN** (unchanged). Nothing here
  licenses `COMPUTED_VERIFIED`, and `SIGHTED` was never in scope.

### Debt explicitly NOT addressed

The **254 other `experience.profile` family cells** (255 total, all currently
`MUST_NOT_REACH`) were not corrected, not re-adjudicated, and not counted. Sonnet's
§9b argues most of the reasoning is a category error — conflating "nobody reads the
`--ds-experience-profile` marker" with "nobody reads the control's real channels".
I did not test that claim on any family beyond confirming that Card's own cell would
need to change, and I did not change it. **This memo is not evidence about those
254 cells in either direction.**

Equally, nothing here is evidence that `experience.profile` is inert. The compiler
demonstrably emits 28–30 channels per stop. What is unproven is only whether the
browser paints them — because the instrument would not run.

---

## 5. What the DT has to decide before this control can be calibrated

Ordered by dependency. Item 1 is unavoidable; items 2–3 are cheap once 1 is paid.

1. **Teach the harness `profile-id`, accepting that all 20 closed receipts go
   stale and must be re-emitted in the same session.** ~One branch in
   `ingressValueForStop` returning `stop.id`, plus removing `'profile-id'` from the
   fail-closed drill list and adding a positive drill for it. This is a programme
   decision about the instrument, above a single-control packet's authority — which
   is precisely why I stopped rather than wrote it. It unblocks **two** controls
   (`experience.profile` and `recipe-profile`), so paying it once is efficient.
2. **Adjudicate `declaredOutputs.channels`.** Adding the two `--ds-table-header-*`
   channels supplies a direct-read control fixture with zero fixture work and
   removes the `harness-suspect` verdict. It desyncs from the registry's
   `derivedChannels`, which no gate checks; if the DT wants them synced, the
   registry edit repins `registryDigest` across all 20 control manifests — the
   known `[[repin-registry-stales-closed-receipts]]` hazard.
3. **Decide the scenario set.** `bithire × technical` is a structural identity
   no-op and should be either dropped or re-labelled as a designed-null control
   scenario rather than reported as an inert finding. If six scenarios are still
   wanted, the honest sixth is a second theme, not a third vertical.
4. **Optional, and the only thing that would make Card a strong witness:** the
   `title` part. Without it `--ds-letter-spacing-heading` — the one declared channel
   with a real, unambiguous, non-radius painted chain — cannot be witnessed at all.
   That is a `fixtures.json` edit and was correctly forbidden here.

---

## 6. Artifacts left behind

All scratchpad-only; nothing under the repo, nothing under the evidence root.

```
<scratchpad>/door-probe.mjs            both doors × 3 verticals × 2 stops, declared-channel emission
<scratchpad>/edge-probe.mjs            full moved-channel enumeration per stop (28 / 30)
<scratchpad>/bithire-why.mjs           the bithire DB divergence, per stop
<scratchpad>/why2.mjs                  per-vertical DB baselines (all three emit 0 vars)
<scratchpad>/experience.profile.TEMP.json   temp manifest used ONLY to reach the blocker
<scratchpad>/dial-technical.json       full-expansion dial, technical
<scratchpad>/dial-editorial.json       full-expansion dial, editorial
<scratchpad>/dial-decl-technical.json  DECLARED-ONLY dial, technical — the decisive artifact
<scratchpad>/dial-decl-editorial.json  DECLARED-ONLY dial, editorial — the decisive artifact
```

scratchpad = `/private/tmp/claude-502/-Users-daniel-Developer-Rottay-ui-design-system/56d00930-b673-4712-9c0a-293132156548/scratchpad`

**Persisted:** `/private/tmp/f4b-experience-profile-opus-source-ready.md`
**Companion:** `/private/tmp/f4b-experience-profile-opus-source-ready.md.ready`
