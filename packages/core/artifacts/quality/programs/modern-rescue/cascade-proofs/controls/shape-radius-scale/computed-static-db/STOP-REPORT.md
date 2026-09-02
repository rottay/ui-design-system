# F4B control 3/20 `shape.radius-scale` — **STOP** (preflight refutation)

Verdict: **STOP**, not SOURCE_READY. No repo source was edited; `staged=0`;
nothing committed or pushed. The stop is the one the brief pre-authorized:
*"Si static/DB no pueden expresar el mismo stop causalmente, STOP con evidencia
y fallback concreto, no fuerces parity."*

- HEAD `5ce42e1b7e9de3b65d70e7caa49de82d96c44407` (clean, unchanged)
- Mapping `/private/tmp/f4b-control-3-sonnet.md` sha256
  `c215c3e9310d5331bb6704a59d2616fa1b486b395fe52609c4f45f2b0628b8d6`
  (owner-confirmed; matches its own `.ready` sidecar and pins this HEAD)
- Node `v22.17.0`; `assertDistFresh` → `ok:true, failures:[]` before every read
- Durable evidence:
  `packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/`
  (`preflight-ingress-refutation.mjs` + `.json`) — untracked, re-runnable

Every number below came from the real compiled compilers loaded through the
harness's own `loadCompilerArms()`. Nothing is inferred from reading source
alone; source is cited only to explain a measured result.

---

## The blocking finding

**The static door the contract declares does not carry this control.** The
authorized slot `surfaces.borderRadius.lg` lowers `--ds-radius-scale: "1"` at
**all 4 stops on all 3 verticals** — a constant. The stop value never reaches
the channel.

```
B_static_authorized_slot   path=surfaces.borderRadius.lg
  rottay/recto  sutil  suave  amplio   -> {"--ds-radius-scale":"1"}  (x4)
  bithire/recto sutil  suave  amplio   -> {"--ds-radius-scale":"1"}  (x4)
  evnto/recto   sutil  suave  amplio   -> {"--ds-radius-scale":"1"}  (x4)
```

The brief authorized that slot **conditionally** — "sólo … si la cadena real
prueba que gobierna `--ds-radius-lg`/`--ds-card-border-radius`". The chain
proves the opposite, so the condition fails and the authorization does not
arm.

### Why it is inert — and worse than inert

`brand-theme/index.ts:915-953` emits `borderRadius.{sm,md,lg,xl}` as
`--ds-radius-{step}-**base**`, the *operand* of the dial, never the dial. When
a scale IS active the base is emitted as `calc(authored / scale)` **on
purpose**, so that `default.css:778`'s `calc(base * scale)` reproduces the
authored value. The slot is not merely silent about the dial; it is the
compensation path that **cancels** it. Measured:

```
E_raw_compiler (compileBrandTheme, dist)
  borderRadius.lg="12px"                  -> scale "1"    lg-base "12px"
  radiusScale=0.9                         -> scale "0.9"  lg-base null
  BOTH lg="12px" + radiusScale=0.9        -> scale "0.9"  lg-base "calc(12px / 0.9)"   <-- cancels
  borderRadius.lg=0.9  (numeric)          -> scale "1"    lg-base 0.9                  <-- invalid length
```

The last row matters independently: the domain is `bounded`, so
`ingressValueForStop` writes the **number**. The probe would set
`--ds-radius-lg-base: 0.9` — a unitless value where a `<length>` is required.
Even setting the cancellation aside, the authorized slot lowers an invalid
value.

### It would have gone green as a false INERT

`lowerStop`'s fail-closed guard ("emitted none of the declared channels") did
**not** fire, because `--ds-radius-scale` is emitted unconditionally as `"1"`
(`brand-theme/index.ts:714`). A constant-valued declared channel satisfies the
guard while carrying zero stop information. A causal run would have reported
*"the control moved nothing"* and a reader would have blamed the CSS or the
fixture, not the door. This is the exact failure class the ingress docblock
says the unit exists to prevent, and it is still open for **any** control whose
declared channel has a non-conditional default.

---

## What DOES work (measured, not proposed)

`BrandSurfaces.radiusScale` — contracts:599, documented verbatim as *"Bounded
multiplier for the canonical radius ramp"* — lowers cleanly on every cell:

```
C_static_real_dial   path=surfaces.radiusScale
  {rottay,bithire,evnto} x recto/sutil/suave/amplio -> 0.75 / 0.9 / 1 / 1.15  (exact)
```

This is **not a second dial**: it is the same `--ds-radius-scale` the manifest
already declares, reached through its real field. The painted chain is intact
(`default.css:778` `--ds-radius-lg: calc(var(--ds-radius-lg-base) * var(--ds-radius-scale,1))`,
consumed by the fixture's `--ds-card-border-radius: var(--ds-radius-lg)`).

### DB arm, as declared — unchanged, and it works

```
D_db_as_declared   path=appearance.general.shape.radiusScale
  recto  (0.75) -> REJECTED on all three: "$.appearance.shape.radiusScale: Value exceeds the <v> envelope"
  sutil  (0.9)  -> 0.9    on all three
  amplio (1.15) -> 1.15   on all three
  suave  (1.0)  -> bithire: "1"   |   rottay + evnto: NO channel emitted
```

`recto` behaves exactly as the manifest's `edgeLaw` predicted — a real
rejection against the `{0.8,1.2}` envelope, not a clamp. That half of the
mapping is confirmed.

**`suave` is a new finding the mapping did not have.** At the default stop the
DB compiler emits nothing on `rottay` and `evnto` (writing 1 equals their
vertical default, so it is a no-op) but does emit on `bithire`. So the default
stop is DB-inexpressible on 2 of 3 verticals — the same asymmetry shape as
`recto`, with no law line in the manifest yet.

---

## Root cause is systemic, and it blocks the declared fallback too

The manifest is a **generated** artifact: `manifest/generator/index.mjs:222`
sets `staticBrandThemePath` from the capability registry's `brandThemePath`
(`src/foundation/contracts/composition/tenants/capabilities/index.ts:203`).
Patching the manifest alone would be overwritten on the next generation.

`buildIngressInput` resolves a path by literal `path.split('.')`. Across the
20 controls:

| declared static path | count | resolvable |
|---|---|---|
| literal dotted path | **7** | yes |
| wildcard (`surfaces.borderRadius.*`) | 6 | no |
| brace set (`palette.{primaryColor,…}`) | 4 | no |
| prose (`typography (ramp channels)`) | 3 | no |

**Both controls closed so far — `spacing.rhythm` and
`surfaces.effect-intensity` — are in the 7-control literal set. All 13
non-literal controls are still `UNKNOWN`.** This packet selected the first
control whose static door is not expressible.

The mapping's declared fallback `typography.scale` has the **identical**
defect, measured:

```
typography.scale  staticBrandThemePath = "typography (ramp channels)"
  static compacta/normal/amplia -> {"--ds-type-scale":"1"}  (constant, same false-inert)
  db     compacta 0.94 | amplia 1.06 | normal -> no channel emitted
```

So switching to the fallback would **not** unblock the packet. Reporting that
rather than burning a second round discovering it.

---

## Concrete fallback (needs one owner decision)

**Option A — correct the door (recommended).** In
`capabilities/index.ts:203`, `brandThemePath: 'surfaces.borderRadius.*'` →
`'surfaces.radiusScale'`; regenerate manifests; re-pin
`semanticOwner.registryDigest`. Blast radius: the digest
`7543b5262d4a58c1f80ed954a7177008f450be9bfb3c0554b7f3993fcacb6fc7` is pinned
**identically by all 20 control manifests**, so a one-string correction re-pins
20 files. No compiler behavior changes. With it, this canary is fully
expressible:

- static — 4 stops x 3 verticals (measured above)
- DB — `sutil` + `amplio` x 3 verticals
- `recto` — DB rejection, `edgeLaw` already written
- `suave` — needs a new law line for the rottay/evnto no-op

**Option B — pick a control from the literal-7 set** (`experience.profile`,
`profiles.icon`, `recipe-profile`, `responsive.posture`, `token-overrides`) and
leave the door defect for a dedicated packet. Cheapest path to 3/20; leaves the
false-inert vector open.

**Not viable:** `typography.scale` (same defect, measured), or forcing parity
through `borderRadius.lg` (would publish a green cell for a door no tenant
travels).

## Still required whichever option wins

`border-fixed` **cannot** be reused: its property list bundles all four
`border-*-radius` longhands with width/style, so binding it would assert the
channel under test must not move. The one new vocabulary entry (border
width/style, radius excluded) stands as mapped. `color-fixed`,
`font-metrics-fixed`, `motion-fixed`, `control-height-fixed` reuse as-is.

## Not done, and why

No manifest, family-cell, roadmap or vocabulary edit was written: all of them
encode a calibration result, and there is no valid result to encode. The
roadmap stays at **2/20**. No `COMPUTED_VERIFIED`, no `SIGHTED`. No browser
run — the ingress arm never produced a distinguishable payload to measure, so
a browser pass would have measured the baseline against itself.
