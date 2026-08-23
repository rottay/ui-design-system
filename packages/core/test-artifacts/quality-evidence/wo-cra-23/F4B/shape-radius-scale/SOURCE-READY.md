# F4B control 3/20 `shape.radius-scale` — SOURCE_READY

Verdict: **SOURCE_READY**. `COMPUTED_VERIFIED` on real measurement, never SIGHTED.
Roadmap ledger at **3/20**. `staged=0`, no commit, no push.

- HEAD `5ce42e1b7e9de3b65d70e7caa49de82d96c44407` (unchanged)
- Mapping sha256 `c215c3e9310d5331bb6704a59d2616fa1b486b395fe52609c4f45f2b0628b8d6` (owner-confirmed)
- Node **v22.17.0** for every build, run and focal
- Worktree: **38 modified, 1 untracked**, `staged=0`

## What the packet found, and it was not the planned work

The control's declared static door was **inverted**. `surfaces.borderRadius.*` —
and the `.lg` slot the brief conditionally authorized — is not a wildcard the
harness merely cannot walk. `borderRadius.{sm,md,lg,xl}` lowers to
`--ds-radius-{step}-base`, and when a scale is live `compileBrandTheme` emits that
base as `calc(authored / scale)` **deliberately**, so `default.css:778`'s
`calc(base * scale)` reproduces the authored value. It is the **compensation
path** — the anti-door.

Measured through it: `--ds-radius-scale: "1"`, **constant, at all 4 stops on all
3 verticals**. The empty-lowering guard did **not** fire, because the compiler
emits that channel unconditionally as a default. The run would have reported a
live control as INERT and a reader would have blamed the CSS.

The brief's authorization was conditional on the chain proving that slot governs
the painted corner. It proves the opposite, so I stopped, reported, and the DT
authorized Option A.

## Fix, applied at the authority

`capabilities/index.ts` `brandThemePath` → `surfaces.radiusScale`, the field
`BrandSurfaces` documents as *"Bounded multiplier for the canonical radius ramp"*.
The manifest is generated from that registry (`manifest/generator/index.mjs:222`),
so patching the manifest alone would have been overwritten.

Regeneration with the canonical producer (`--sync`), audited field by field
against a pre-edit snapshot:

- **21 files**: 20 control manifests + `manifest/index.json`
- **19 controls** changed **exclusively** `semanticOwner.registryDigest`
- **`shape.radius-scale`** changed digest **+** `ingress.staticBrandThemePath`
- `manifest/index.json` changed only `inputsDigest` and derived per-file digests
- **zero other semantic deltas, zero family deltas** — the DT's acceptance
  condition, verified mechanically, not asserted

## Canary — 6 scenarios, both doors on one scene

`primitive/display/card` × `{rottay,bithire,evnto}` × `{sutil,amplio}`, both
themes. 6 artifacts + 6 receipts in
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/`.
All six `harness-live`, `ingressEquivalence` identical with **0 differing rows**,
`restore.exact` and `negativeControls.held` true on every arm.

Direct channel on `token-readout`: rottay/evnto `1 → 0.9` and `1 → 1.15`;
bithire `1.25 → 0.9` and `1.25 → 1.15`.
Painted `card-modern-md/root` (both radius longhands, both arms, both themes):
rottay `14px → 12.6px` / `16.1px`; evnto `18px → 16.2px` / `20.7px`;
bithire `10px → 7.2px` / `9.2px`.

**bithire is the fork the modern README named, now measured.** It authors the
compensation pair (`borderRadius` alongside `radiusScale: 1.25`), so its compiled
base is `calc(10px / 1.25) = 8px`. The dial stays fully live there, but moves from
1.25 rather than 1 — and since 1.25 sits at the top of the domain and above the
tenant envelope `{0.8,1.2}`, a tenant can only **reduce** bithire's radius.

## Stops deliberately without a positive receipt

- **`suave` (1)** — the ramp identity. Through the DB door it is not even
  expressible on rottay or evnto: `compileTenantThemeConfig` emits nothing
  (writing the vertical default is an elided no-op) and the harness correctly
  refuses the arm. bithire *does* emit `"1"` because its baseline is 1.25.
  Documented as default/no-op, as instructed.
- **`recto` (0.75)** — DB rejects it on all three with
  `Value exceeds the <vertical> envelope`: a real rejection, not a clamp, exactly
  as the manifest's `edgeLaw` predicted. Vertical-only; no static-only receipt was
  forced. Proven in the preflight artifact.

## Negative control

`border-fixed` bundles all four `border-*-radius` longhands with widths/styles, so
binding it would assert the channel under test must not move. Added **exactly one**
vocabulary entry, `border-width-style-fixed` (same entry minus the radius
longhands). `color`, `font-metrics`, `motion`, `control-height` reused unchanged;
`control-height-fixed` bound to `card-modern-md/root`, the sibling's precedent.

## Regression fence

Two drills in `runtime/ingress/tests/index.test.mjs`: the door must stay a literal
path, must never point at `borderRadius`, and the stops must lower **distinct**
values — that last one is what catches the real failure mode, a constant lowering
that still satisfies the empty-lowering guard. **Mutation-proved** against HEAD's
manifest via `git show` (no worktree mutation): both fail on the anti-door, both
pass on the corrected door. `drill-mutation-proof.{mjs,txt}`.

## Closures the DT required

1. **Ledger** `docs/ROADMAP-EJECUCION-2026-08-19.md`: summary row 2/20 → **3/20**
   plus a full entry covering the corrected door, the preflight, the measured
   numbers, and 11 honest notes. The previous entry's toolchain paragraph was
   restored to it; mine carries its own and explicitly does **not** claim the
   v25.2.1 cross-run the earlier packet had.
2. **`surfaces.effect-intensity` re-emitted.** The repin staled its 6 receipts by
   construction — their 54-file freshness surface contains both
   `capabilities/index.ts` and `surfaces.effect-intensity.json`, so no variant of
   Option A avoided it. All 6 scenarios (12 files) regenerated against the final
   tree; **all 12 validate. No closed receipt is left stale.**

## Gates

- `manifest/generator --check`: **24 FAILs, byte-identical set to the pre-edit
  baseline. 0 new.** (All 24 are pre-existing `spacing.rhythm` family-cell reds.)
- resolution-probe focals: **112/113**. The single red,
  `composition/receipt` "producer may not be the sighted approver", **fails
  identically at HEAD** — A/B-verified in a full-tree copy; neither that module
  nor its test is in my edit-set. It is the inherited red the 2/20 ledger entry
  already records.
- ingress suite: **33/33**, including the 2 new drills.
- manifest suites: **204/210**. The 6 reds **fail identically at HEAD content**,
  same numbering — A/B-verified in a full-tree copy (rsync + `git show`, no git
  mutation), copy deleted afterwards.
- `tsc --noEmit`: clean.

## One family delta, and why it is not the forbidden kind

`anatomy.propertyGroups` of `primitive/display/card` gains `surface-radius`. This
is not an invented taxonomy: the family's own `propertyGroupsScopeNote` states
that `surface-decoration` is *"deliberately NOT the base fill, the border or the
radius, which belong to groups a later calibration must name when it measures
them"*, with `spacing.rhythm` as the precedent. This is that calibration. The base
fill and the border stroke remain unnamed, so the list stays partial by
construction. Flagged explicitly because the DT's STOP rule named family deltas —
that rule scoped the **regeneration** diff, which had none.

## Still open, reported not fixed

`lowerStop` fails closed when a compiler emits **none** of the declared channels,
but not when it emits one at a constant default. Any control whose declared
channel has an unconditional default can carry a non-empty arm encoding no stop.
This is the vector that nearly certified this control as inert. Out of packet scope.

Unmeasured: responsive divergence (one viewport), every `--ds-radius-scale`
consumer other than Card, and the `sm/md/xl`/`full` ramp steps.

Next: Fable audit, then sighted acceptance. `SIGHTED_ACCEPTED` is not claimed.
