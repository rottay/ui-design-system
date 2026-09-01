# Cascade probe

**Every measuring instrument in this repository measures reachability. None
measures resolution. Every defect this programme cares about lives in that
gap.**

Reachability asks *does a chain connect a tenant's decision to a CSS property?*
Resolution asks *what does the browser actually paint for this tenant?* A
channel can be perfectly connected and paint the wrong colour. A dial can score
as connected and move nothing.

This harness answers the second question: static HTML fixtures + the shipped
CSS + a headless browser reading `getComputedStyle`. No app, no dev server, no
router, no registry, no port — the job is *load stylesheet, set an attribute,
read computed style*, and nothing heavier is warranted.

It answers a third question too, and that one needs three phases rather than
two: *does the control CAUSE the change, leave the declared negative controls
untouched, and restore the baseline exactly when a tenant removes it — through
both ingress doors, on one scene?* See **A causal run** below.

---

## Run it

```bash
cd packages/core

# every vertical × theme × fixture, written to an artifact
node scripts/check/tokens/cascade/probe/public/cli/index.mjs run --out before.json

# turn one tenant dial and report exactly which painted properties moved
node scripts/check/tokens/cascade/probe/public/cli/index.mjs dial \
  --set --ds-radius-scale=1.5 --out dial.json

# baseline -> mutation -> removal, both ingress doors, one scene. NO --payload:
# this command calls loadCompilerArms() + lowerStop() itself and imports the
# REAL compiled compilers from dist/ -- it never accepts a variable map from
# the outside. Every --bind target must be a real "fixtureId/targetId" pair
# from FIXTURE_IDS, enforced mechanically at parse time.
node scripts/check/tokens/cascade/probe/public/cli/index.mjs causal \
  --control-manifest governance/manifest/controls/spacing/rhythm/index.json \
  --family-manifest governance/manifest/families/primitive/layout/flex/index.json \
  --stop airy --vertical rottay \
  --bind control-height-fixed=button-modern-md/hitbox --out causal.json

# what changed between two runs
node scripts/check/tokens/cascade/probe/public/cli/index.mjs diff before.json after.json

# the tenant-less document — base + engine, no artifact, no tenant attributes
node scripts/check/tokens/cascade/probe/public/cli/index.mjs run --vertical none --out base.json

# the drills — run these before trusting a number this thing produced
node --test scripts/check/tokens/cascade/probe/public/drills/tests/index.test.mjs   # needs a browser

# the causal mechanics — pure, fast, no browser
node --test scripts/check/tokens/cascade/probe/foundation/causality/tests/index.test.mjs
node --test scripts/check/tokens/cascade/probe/foundation/guards/tests/index.test.mjs
node --test scripts/check/tokens/cascade/probe/foundation/negative-controls/tests/index.test.mjs
node --test scripts/check/tokens/cascade/probe/runtime/ingress/tests/index.test.mjs
node --test scripts/check/tokens/cascade/probe/composition/run/tests/index.test.mjs
node --test scripts/check/tokens/cascade/probe/composition/receipt/tests/index.test.mjs
```

**Any lane touching the base layer must ask for `--vertical none`.** A vertical
artifact is unlayered tenant paint that outranks the base layer, so a base-layer
defect is invisible in all six tenanted cells *by construction* — six green
cells are not evidence about the base layer, they are evidence that an artifact
covered it. Measured: `--ds-text-eyebrow-letter-spacing` and
`--ds-text-eyebrow-transform` were declared by all three artifacts and by
nothing in base, while `themes/default.css` read them **bare**, so every tenant
resolved and a tenant-less document rendered its table header at the initial
value. Both lanes that found it were reading source; no run could see it.

It is deliberately **not** in the default run: adding a fourth scope would
change the shape of every artifact and break comparability with every run taken
before it existed. `--bundle dist|styles` refuse for it rather than quietly
recomposing, because nothing ships a tenant-less bundle.

Layers, in dependency order — every edge runs downward, and
`node scripts/check/architecture/audits/structure/index.mjs --check` is green with these files in
the tree:

```
foundation/  paths, scope (the root-attribute vocabulary), roster (+ fixtures.json),
             causality (phases, exact restore, inline write/restore planner),
             guards (the fail-closed measurement guards + initial-values.json),
             negative-controls (manifest reader + vocabulary.json)
runtime/     bundle (which CSS is authoritative), browser, measure,
             ingress (the two tenant doors, as cascade positions)
composition/ run (bundles × scopes × fixtures → artifact; and the causal report),
             diff, receipt (emits; the programme's validator validates)
public/      cli (run | dial | causal | diff), drills (+ tests)
```

Peers inside one layer never import each other — the structure audit calls that
`sibling-owner-dependency`, and it is why `foundation/roster` re-derives its own
directory instead of importing `foundation/paths`. Anything two foundation units
would share is either passed in by a caller or duplicated deliberately.

Exit codes: `0` ran clean; `1` a fixture no longer matches the CSS, a dial run's
own controls did not move, or a causal run did not pass its verdict; `2` bad
invocation.

Nothing here is registered in `scripts/check/automation/gates/manifest/index.mjs`, and every test
file is `.test.mjs` so the vitest project (`src/**/*.test.{ts,tsx}`) cannot
sweep it into the suite. That is deliberate for two different reasons: the
browser drills need a browser, and the causal-mechanics drills are fast enough
to run by hand and specific enough that a red one is meant to stop the person
who caused it rather than a CI job three hours later.

The fixture-drift test is the deliberate exception. It is `.test.tsx` and *is*
swept into the unit suite, because it needs React and no browser, and because a
fixture that has stopped describing its component must fail in CI rather than
wait for someone to run the probe:

```bash
vitest run --project unit scripts/check/tokens/cascade/probe/foundation/roster/tests
```

---

## Which CSS is authoritative

`dist/*.css` is what the npm tarball ships, so it looks like the obvious thing
to measure. Three facts complicate that:

1. **`dist/` can go stale.** It is regenerated by a build, so between a source
   change and the next build the published bundle may describe the previous
   tree. `node --test scripts/build/verticals/css-freshness/index.mjs` is the
   authority on which regime the repository is in: it recomposes the committed
   generated bundles and identifies any first divergent line.
2. **`artifacts/generated/css/` is generated output, not authored truth.** The
   probe verifies its per-vertical artifacts against `dist/`, while the
   freshness gate verifies them independently against source.
3. **Agreement between outputs is insufficient.** A stale published bundle and
   a stale generated artifact can agree, so source recomposition remains the
   required proof.

So the default is `--bundle fresh`: recomposed in memory from
`src/foundation/tokens/css/**` using the same formula as the staleness gate
(postcss + `@tailwindcss/postcss` on the modern engine, recursive `@import`
inlining for base and tenant, font packs ahead of base). No build step.

`--bundle dist` and `--bundle generated` are available and are labelled
`freshnessProven: false` in the artifact. Whatever the mode, the artifact
carries the sha256 of the exact string handed to the browser, and a `fresh`
bundle additionally carries the first line at which it diverges from the
shipped one.

That formula is *transcribed*, so it could drift from the real one and produce
a bundle that is fresh only by its own definition. The formula drill runs the
staleness gate as a subprocess and requires the two to agree **per vertical, in
whichever regime the repository is in**: where the gate reports a divergence the
probe must name the same line, and where it reports none the probe must also
find the shipped bundle byte-identical. Disagreeing about the regime is itself
the finding.

**What `fresh` cannot produce:** `scripts/build/verticals/css-build/index.mjs` appends a per-tenant
`--ds-motion-spring: linear(...)` tail derived from compiled BrandTheme modules
under `dist/`. That needs a build, so `fresh` omits it — exactly as the
staleness gate does. Probing `--ds-motion-spring` requires `--bundle dist` and
accepting its staleness.

---

## What it cannot see

Say this out loud rather than discovering it later.

- **Anything that originates in React**, at measurement time. Recipe-profile
  prop defaults, conditional `data-*` driven by state, inline styles a
  component computes per render. This harness can prove a *rule* is dead, and
  that a rule paints value X for an element shaped Y — it cannot itself prove a
  component ever produces an element shaped Y.

  That second, smaller instrument now exists:
  `foundation/roster/tests/index.test.tsx` renders each component fixture's
  engine and compares it to the fixture, so staleness fails a test instead of
  producing confident readings about an element nothing renders. It runs in the
  unit suite, not here — it needs React, not a browser. It ships with a
  positive control (six drift shapes that must each be caught *and* named) and
  a coverage check: a fixture is either registered for a render or declares
  `"synthetic": true`, so a new component fixture cannot arrive without cover.

  **This gap was not hypothetical.** `button-modern-md` and `input-modern-md`
  described `.ds-btn` / `.ds-input` — rustic rules no component emits — and
  were wrong in 4 of 276 readings, all in the one vertical that authors control
  geometry. `card-modern-md` was missing its variant class, which no selector
  reads today and so cost nothing yet. Both are replayable against the test.
- **The spring tail** under `--bundle fresh` (above).
- **Anything needing layout at more than one viewport.** One pinned viewport
  (1280×800, dpr 1). Responsive divergence is not in v1.
- **Engines other than the one asked for.** `--engine` defaults to `modern`;
  the engine scope class is stamped by components on their own roots, so
  engine-scoped paint is only visible where a fixture carries the class.
- **Font loading.** Subresources are aborted by the route handler, so
  `font-family` reads as the declared stack. Metric-dependent values
  (line box heights) reflect the fallback font.

### What the causal path has NOT yet been seen to do

Written and unit-drilled, but never executed against Chromium as of this
writing. Say it plainly rather than let a green `node --test` imply more than it
proved.

- **`measureCausalScope` has never run.** Its judgement is all in
  `buildCausalReport`, which is pure and fully drilled; what is unproven is the
  browser choreography: that a route handler swapping `servedCss` between three
  `page.goto` calls really serves three different stylesheets, that
  `element.style.getPropertyValue` on `documentElement` returns what
  `readInlineMemo` assumes, that the two-frame settle is enough before the
  removal read, and that `readRootAttributes` sees the attributes SSR emits.
- **Preset AND numeric-gap rhythm fixtures now exist for all four layout primitives.** The
  roster is no longer radius-only: `foundation/roster/fixtures/index.json` declares
  `{flex,grid,stack,space}-modern-preset-gap` (rhythm MUST scale these) and their negative
  counterparts `{flex,grid,stack,space}-modern-numeric-gap` (rhythm must NOT), each pair derived
  from the real engine source and the real CSS specificity/source-order law that decides which
  rule wins — not asserted in prose. `token-readout` is now the direct-read control fixture for
  rhythm too (`--ds-rhythm-scale`/`--ds-rhythm-effective-scale` added to its property list; no
  separate `rhythm-readout` fixture needed). `button-modern-md` gained a second `hitbox` target on
  the same element, reading real sizing longhands PLUS `@rect-inline-size`/`@rect-block-size`
  (`getBoundingClientRect`, so a transform/zoom mutation cannot hide from it) — a real bindable
  target for `control-height-fixed` and `touch-target-fixed`. **Still missing: a fixture that
  renders a real `Icon` inside `Button`.** The full icon adapter pipeline (Phosphor SVG generation)
  cannot be hand-derived byte-for-byte without executing `renderToStaticMarkup`, and a wrong guess
  would be a permanently-failing roster drift test — worse than the honest gap. `icon-size-fixed`
  binds to `button-modern-md/hitbox` as a mechanics stand-in until a real icon fixture exists; that
  is not a semantic claim about icon geometry. Every binding/control target is now enforced
  mechanically against `FIXTURE_IDS` (`assertKnownTargetKeys`, called from the CLI's `--bind`
  parser and drilled in both `foundation/negative-controls/tests` and `composition/run/tests`).
- **The CLI causal command now calls the compilers itself; running it against Chromium has
  not.** `causal` no longer accepts `--payload` — it calls `loadCompilerArms()` +
  `lowerStop()` and imports the compiled modules under `dist/` for real, so the arm's `variables`
  and `producedBy` always come from `compileBrandTheme`/`compileTenantThemeConfig`, never from a
  JSON file a caller could have hand-written. `lowerStop` also reshapes the manifest-path-relative
  document into the argument shape each compiler function ACTUALLY takes, verified against
  source: `compileTenantThemeConfig` takes the read/compile ENVELOPE
  (`{schemaVersion, mode:'simple', appearance}` plus the trusted identity columns), so the stop
  moves from the manifest's normalized `appearance.general` position into the config's flat
  `appearance`, and the arm compiles for a CUSTOMER tenant because first-party slugs are reserved;
  `compileBrandTheme(input: BrandCompilerInput)`
  destructures `{ brandTheme, tenantSlug }`, so it needs `{ brandTheme: document, tenantSlug }`,
  never the bare `BrandTheme` fragment. What remains unverified is only the browser half —
  `loadCompilerArms` records `freshnessProven: false` since `dist/` is a build product, and the
  causal run pairs it with the stale-source guard, whose freshness surface now spans the
  instrument, both manifests, the control's own `sourceBindings` (TS lowerers + productive CSS),
  a family's own `sourceBindings` (productive CSS + TSX), the two compiled `dist/` modules AND
  their `.ts` sources, `dist/build-stamp.json`, and the composed bundle's own input files.
- **The family narrowing is implemented and currently fails closed.** The four
  layout families declare negative controls in prose that is not a
  "did-not-move" claim (`gap=-8, NaN or Infinity normalizes to 0px and stamps no
  preset`). Those phrases have no vocabulary entry, so a run that passes a
  family manifest is `harness-suspect` and names them. That is the designed
  behaviour, not an oversight: the fix is a machine-readable binding in the
  family manifest, which is not this instrument's file to write.

---

## A causal run

`run` and `dial` produce readings. A **causal run** produces a verdict about a
public control, and it needs a third phase to do it.

```
baseline  ->  mutation  ->  removal
```

A two-arm before/after can show a channel MOVES. It cannot show the move is
REVERSIBLE, and irreversibility is the failure a tenant actually meets: they try
`airy`, dislike it, unset it, and the product does not come back.

### Restore is exact, and every differing row is named

The removal phase is compared against the baseline across three things, not
one:

1. every measured **computed property** — the painted longhands;
2. every measured **CSS custom property** — a latched variable that nothing
   currently reads is still a restore defect, because the next consumer added
   to that chain inherits it;
3. the **root attributes** — a `data-*` the mutation stamped and the removal
   forgot is invisible in both of the above until some selector keys on it.

There is **no tolerance**. `13.6px` versus `13.5999px` is a finding. A tolerance
is a place for a real restore defect to hide, and the defects this programme
cares about — a stale attribute, a channel that latched, an instance value that
survived a rerender — express themselves as exactly the size of difference a
tolerance would swallow.

### Removal is removal, not "write the default back"

A tenant unsetting a control removes their declaration and whatever was
underneath resurfaces. Writing the default value back is a different operation
that agrees with removal only while the underlying value happens to BE the
default — which is precisely what a calibration run must not assume.

So the inline plan is built from a memo taken **before** the write:

- a property the harness introduced is `removeProperty`'d;
- a property that already had an inline value is `setProperty`'d back to that
  exact value **with its priority**;
- a property whose prior inline state was never observed **throws**, because
  removal could not then tell "unset what I wrote" from "delete what was already
  there", and both look green afterwards.

For the static arm, removal re-serves the **baseline string unchanged** — not an
equivalent recomposition, the same bytes. That is a stylesheet's version of the
same law, and the artifact records the sha256 of all three phases plus
`removalIsByteIdenticalToBaseline` and `mutationDifferedFromBaseline`, so a
reader checks it instead of trusting it.

Each phase is served at its **own URL** (`bundle.css?phase=…`, and a matching
document). A stylesheet-arm run navigates the same page three times, and a
browser is entitled to answer the second and third `bundle.css` from its memory
cache without the route handler being consulted — which would measure the
baseline sheet during the mutation phase and report the control as inert. That
is the most convincing false negative this harness could produce, so distinct
URLs make each phase a distinct subresource and the cache cannot answer.

### The data-terminal probe

Some controls paint nothing. `responsive.posture` travels
document → schema → compiled artifact and reaches geometry through a JS solver,
never through a CSS channel — its `declaredOutputs.channels` is empty and its
own manifest says so. For those, `data-causal` is the instrument:

```bash
node scripts/check/tokens/cascade/probe/public/cli/index.mjs data-causal \
  --control-manifest governance/manifest/controls/responsive/posture/index.json \
  --vertical rottay --out data.json
```

Three phases over DOCUMENTS instead of a DOM: compile with no stop, compile per
stop, compile with the stop removed again. No bundle, no browser, no fixture —
both halves are plain function calls on a compiled artifact, which makes this
the only capability here that pays no Chromium cost.

**The CSS instrument REFUSES these controls, and that refusal is load-bearing.**
`lowerStop` and `assertStopDiscrimination` both throw on an empty
`declaredOutputs.channels`, and the DB arm cannot even build an input when the
control's keypath does not start at `appearance.general`. Running the CSS
harness against a channel-less control and reporting "negative controls held"
would be a verdict about nothing at all. So this is a sibling command, never a
flag on `causal`.

Four fail-closed guards, because none of the five CSS guards applies — every one
of those is about a selector or property producing no reading, and there is no
selector here:

| guard | fires when |
|---|---|
| `data-absent` | a stop was requested and the field is `undefined` on the compiled output |
| `data-constant` | two DIFFERENT requested stops read the SAME value — indistinguishable from an ingress that ignores the request |
| `data-bypass` | an out-of-catalog id fails to produce BOTH a write-time throw AND a render-time fail-closed default. **Two layers, asserted separately**: conflating them misreports which one actually fails closed |
| `data-restore` | after removal the field is still present. Stricter than the CSS byte law on purpose: the consumer branches on `!== undefined`, so a removal that leaves the DEFAULT VALUE behind takes the other branch of the resolver — identical value, different path |

Below two witness stops the run is `data-not-decidable` and is refused, exactly
as the CSS stop-discrimination guard refuses; an adjudicated
`calibration.dataDiscriminationException { reason, adjudicatedBy }` is the only
way past, and the list is born empty.

The restore law is not re-implemented: a DATA observation is projected into the
same `scope → target → property` shape `compareExact` already speaks, so exact
restore and the row vocabulary are inherited verbatim. What the observation
carries with it is its KIND — `readingKind: 'data'` — because a DATA field like
`responsivePosture` does not start with `--` and name-shape inference would
label it `computed-property`, a CSS verdict on something no browser painted. The
kind is declared, never deduced, and comparing two observations of different
kinds is refused.

**THE LIMIT, and it is as real as H-2's: this probe proves the datum ARRIVES and
VARIES, not that the resulting geometry is the right geometry.** That the field
lands where the contract says, differs per stop, and disappears on removal is
what it establishes. That a board laid out under `spanBias: 'min'` looks as it
should is sighted acceptance, and no run in this directory can supply it.

Between "the datum arrived" and "the geometry is good" there is a middle claim
worth receipting: that the datum REACHED the solver. `data-causal` records it as
**behavioural witnesses** — `{id, question, holds, detail}` measured by the
caller, which is the only layer that knows what a posture is. The instrument
stays domain-blind but refuses to report a pass while a declared witness is
false, so a scenario cannot be run, come back red, and be quietly dropped from
the verdict; a witness with a non-boolean `holds` throws rather than counting as
a failure, because an unmeasured witness is a gap in the harness, not a defect
in the control. The `responsive.posture` run declares four: the consumer
resolving the requested stop off the real artifact, the ladder's falsifiable
prediction (band width invariant, onsets shifted), the solver producing a
different geometry from the same inputs under a different `spanBias`, and a
NEGATIVE — that `WidgetBoard`'s capacity tier does NOT move with the stop.
Negatives are written so both halves must hold: "the board did not move" alone
would also pass with a dead ladder, so the witness additionally requires the
ladder to move at the same widths.

The receipt's `evidenceKind` is **`data-field-delta`**, which `data-causal`
defaults to; `--evidence-kind` still overrides. It is a proof role of its own,
never a fourth member of `COMPUTED_DELTA`, because that list is what a CSS cell
reads to satisfy its computed-delta leg and a DATA receipt must not be able to
buy it. Inside the DATA branch of the ladder one such receipt satisfies BOTH the
delta and the restore leg, and that is mechanical rather than generous: this
file sets `verdict.pass` only when `restore.exact` holds, `exitCode` mirrors the
verdict, and `quality-evidence/v2/receipts.mjs` refuses any receipt whose
`exitCode` is non-zero — so a `data-field-delta` receipt that exists at all has
already proven its own exact restore, inside the same artifact.

Receipting is otherwise unchanged — `buildReceipt` is payload-agnostic, so a DATA
artifact is evidence like any other. The freshness surface differs, and
deliberately:
**no CSS.** This probe reads a compiled artifact, never a stylesheet, so bundle
inputs would declare a dependency it does not have and make every receipt churn
on paint changes it cannot see. What it does bind: the instrument tree, the
manifest FILES it reads (not merely the paths they name — the calibration is
part of what the receipt asserts), the compiled server entrypoint it calls, and
the build stamp proving that entrypoint describes this tree.

### Two ingress doors, one scene

A control has two doors, and they land in **different positions in the
cascade**:

| arm | door | lands as | compiler |
|---|---|---|---|
| `static-brand-theme` | `surfaces.rhythm` | a block behind `:is(html[data-tenant='…'], :where([data-ds-root][data-vertical='…']))` | `compileBrandTheme` |
| `db-tenant-theme` | `appearance.general.rhythm` | `setProperty` on `document.documentElement` | `compileTenantThemeConfig` (via `@rottay/design-system/server`) |

"Static and DB are equivalent" is a claim about the cascade, so it is settled by
putting both on the SAME DOM in one run and diffing the two arms. Two separately
taken runs differ in browser state, bundle sha and scene, and each of those is
somewhere a real divergence can hide.

`arm` is an overloaded word here and the two meanings are orthogonal.
`scope.arm` in `foundation/scope` is the tenant SELECTOR arm (legacy
`html[data-tenant]` versus provider `[data-ds-root][data-vertical]`).
`ingressArm` is the DOOR. Every ingress arm is measured on a scene carrying both
selector arms, which is what SSR emits.

**The harness never derives a payload.** A variable map must arrive with a
`producedBy` binding naming the compiler module, the exported symbol and the
input it lowered; without one, `assertArmProvenance` throws. A harness that
could synthesise `--ds-rhythm-scale: 1.2` itself would be proving that it can
multiply and reporting it as proof that the compiler lowers the stop. Use
`loadCompilerArms()` + `lowerStop()` to produce the payload; `lowerStop` keeps
only the channels the manifest declares and throws when the compiler emitted
none of them, because an empty arm would later read as "the control moved
nothing".

A static arm is tenant-scoped, so a causal run carrying one takes exactly one
`--vertical`. Serving a `rottay` block to `bithire` would append a block that
matches nothing, and a block that matches nothing reads exactly like a control
that reaches nothing.

**The static arm composes its stop over the vertical's published baseline**
(H-1, 2026-08-23). `loadStaticBaselines()` reads the three first-party
`BrandTheme`s from `dist/index.js` — the published `exports["."]` entrypoint,
the same class of import the DB arm uses for `./server`, never a deep path — and
`lowerStop` compiles `{ …verticalTheme, …stopAtItsKeypath }`. The arm records
which baseline it used in `producedBy.input.baseline = { source, digest }`, and
a static arm that cannot name one fails `assertArmProvenance`.

This is a change of MEANING, so it is dated. Until H-1 the arm compiled a
one-field theme built from the ingress keypath alone. `compileBrandTheme` read
that input correctly — its density seed is authored-preserving,
`String(bt.surfaces?.densityScale ?? 1)` — but with no baseline present, every
`??` default fired and all three verticals were measured as if they were rottay.
The tell is **uniformity where production diverges**: `density.mode` collapsed
bithire (0.9) and evnto (1.125) onto the rottay gap, and `experience.profile`
reported one `--ds-letter-spacing-heading` for all three. The compiler was never
wrong; the instrument was handing it a theme production does not ship, because
in production `density` and `densityScale` travel in the SAME theme.

The DB arm needs no equivalent and must not be given one:
`compileTenantThemeConfig` resolves the vertical baseline itself, which is why
it composed correctly all along. Passing `base` to it would apply the vertical
twice, silently — so `lowerStop` throws instead.

**The arm must ENCODE the stop, not merely emit something** (H-2, 2026-08-23).
Before measuring, `assertStopDiscrimination` lowers every normalized stop of the
control on that arm and asks whether ANY declared channel takes two different
values across them. If none does, the run is refused: an arm carrying a constant
default is non-empty, so the empty-lowering guard passes it, while it encodes no
stop at all. That is the false-INERT vector `shape.radius-scale` recorded as open
in its `knownDefects`, and two real instances were measured before it closed —
radius pointed at `surfaces.borderRadius` lowered `--ds-radius-scale: 1` at all
four stops, and density pointed at a prose double keypath lowered
`--ds-density-scale: 1` at all three with the stop's own channel absent entirely.

The predicate is a property of the CHANNEL across the stop set, never of a stop,
and that is what makes an identity stop free: `suave`=1 lowers exactly `1` both
inside a healthy set (`0.75/0.9/1/1.15`) and inside an anti-doored one
(`1/1/1/1`). Only the second is an absence. It is EXISTS and not FOR-ALL: a
healthy `density.mode` discriminates on one of its two declared channels, because
`--ds-density-scale` is the vertical's structural scale and is constant within a
vertical by construction. `K` is `declaredOutputs.channels` and nothing wider —
the full emitted map would turn "this control declared its channels badly" into
"this control is alive". Fewer than two lowerable stops is `NOT DECIDABLE` and is
refused too, unless an adjudicated
`calibration.stopDiscriminationException { armId, reason, adjudicatedBy }` says
otherwise; that list is born empty.

**THE LIMIT, and it is a real one: this guard proves the arm ENCODES the stop,
never that the stop PAINTS.** A channel that discriminates but nobody reads still
passes. Per-channel liveness is a different question with different owners:
`ingressEquivalence`, the painted witness, and the scenario's own per-channel
expectations. The live example is `experience.profile` on the static arm — it
PASSES this guard, because accessory channels discriminate, while its principal
channel `--ds-letter-spacing-heading` is pinned by the vertical's authored value
and does not move at all. That inertness is real, it is what degraded that
control from COMPUTED_VERIFIED, and it was found by the painted witness rather
than here. A PASS from this guard is never a claim that every declared channel
lives.

A stop lowered in **isolation** is still a meaningful question — it isolates the
stop's own contribution from the vertical's — but it is not representable in
production, so it must never carry a receipt from this arm. Keep it as an
advisory, non-receipted run.

### Negative controls come from the manifest, not from here

`governance/manifest/controls/<id>.json#calibration.negativeControls` owns WHICH negative
controls apply; `governance/manifest/families/<id>.json#themeControls[].negativeControls`
narrows them onto one family root, and the effective set is the union — a silent
family inherits the full control list rather than escaping it.

`foundation/negative-controls/vocabulary/index.json` owns only the MEASURABLE
definition: given that declared phrase, which computed properties must not move.
It is fail-closed in three directions:

- a manifest phrase with no vocabulary entry is **unresolved**, and the run
  fails naming the phrase. It is never dropped and never approximated;
- a control that declares negative controls and a run that resolved **none** is
  a run with no negative controls at all, which fails;
- an entry scoped to `declared-targets` that the run did not `--bind` fails,
  because "checked nothing" and "checked and found nothing" are otherwise the
  same sentence.

Scope is declared per entry and it matters. `control height remains fixed` is
bound to control-bearing targets on purpose: a LAYOUT container's intrinsic
height legitimately grows when its gaps grow, so asserting it everywhere would
report the control's intended effect as a violation and teach a reader to ignore
the guard. Phrases carry a `partiallyMechanised` list for the parts that are not
computed properties at all (`separator count`, `item spans`), so an entry says
what it does not cover instead of implying full cover.

**`every-measured-target` used to be exempt from "absence is unmeasured, not
inert".** A `declared-targets` entry always reported a missing property as
`unmeasured`; an `every-measured-target` one silently skipped it, so "checked
and found nothing" and "never checked" read as the same green result — for
exactly the assertions (`font-metrics-fixed`, `color-fixed`, `border-fixed`,
`motion-fixed`) that are supposed to hold everywhere. `assertNegativeControlsHeld`
now accepts the measurement `plan` — expanded BEFORE any browser read happens,
the same union-across-scopes plan the guards already use — and an
`every-measured-target` property is `unmeasured` whenever that TARGET'S OWN
plan row declares it but produced no row, without demanding every fixture read
every font/color/border/motion property it never claimed to. `composition/run`
always supplies the plan for a causal report; a caller with no completeness
information (a hand-written unit test) keeps the old lenient reading. The
result also states `expectedRows`/`observedRows`/`checkedRows` explicitly — a
short read is a failure, not a silent pass, and the numbers say so rather than
leaving a reader to infer it from an empty violations array.

**Real geometry, not just computed-style strings.** Two reserved observable
names — `@rect-inline-size`, `@rect-block-size` — are read from
`Element.getBoundingClientRect()` instead of `getComputedStyle`, so a
`transform: scale(...)`/`zoom` mutation that changes what actually renders
cannot hide behind an unmoved `block-size`/`height` computed longhand.
`control-height-fixed`, `touch-target-fixed` and `icon-size-fixed` all include
the pair now.

### The self-check, and what a failed one costs

The causal artifact states its own verdict in its own text, exactly as the dial
report's `controls: harness-suspect` does. Three independent things make it
suspect: a measurement guard fired, the negative controls could not be resolved
from the manifest, or the run's direct-read control fixture did not move. Any
one of them **voids every inert and unchanged verdict in the same artifact**,
including the negative controls that appear to have held — a run that cannot be
shown to observe movement cannot be shown to observe its absence either.

`controlFixtures` has **no default**. `CONTROL_FIXTURES` reads the radius scale,
so inheriting it would certify a rhythm run as live on the strength of a channel
the run never turned. A causal run that declares no direct-read fixture for the
control under test is suspect, which is the honest state of that run.

### Receipts

`composition/receipt` emits; it does **not** validate. The programme already
owns a validator (`scripts/check/evidence/framework/receipts/index.mjs`) and
`evidence-contract/index.json` already states the law, so a second validator would be
a second authority — two that agree teach nothing, two that disagree need a
third.

What the emitter adds is the half nobody else can compute: **the instrument is
part of the source**. `sourceFiles` is the union of the measured files and every
production file under `scripts/check/tokens/cascade/probe/` (tests excluded — a test
edit cannot alter a number), so changing the harness invalidates every receipt
it has produced. A receipt bound only to the measured CSS is satisfied by a
broken harness measuring a healthy tree.

`writeEvidence` requires an **explicit root and has no default**. The evidence
root is a destination a calibration run chooses; a default is how instrument
work accidentally becomes evidence.

**The CLI uses `writeEvidence`/`verifyReceipt`, not a bare file write.** When a
causal run requests a receipt (`--round-id`/`--family-id`/`--scenario-id`/
`--producer` together), `public/cli` calls `writeEvidence` — which writes both
the artifact and the receipt under an explicit `--evidence-root` (default the
repository root) and validates the pair by content once — then REOPENS the
artifact from disk (`readFileSync`, not the in-memory bytes) and calls
`verifyReceipt` a second time against those reopened bytes. Either validation
failing (including "outside the allowed evidence root") makes the command exit
`1` and print every failure; it cannot report success on an invalid receipt.

---

## How it refuses to lie

Five mechanisms for a reading run, each with a drill that has been seen to
fail — and four more for a causal run, in `Fail-closed measurement guards`
below.

**Fixture shapes are derived from the CSS, and re-verified at run time.** Every
fixture declares `requiresSelectors`; the harness asserts each string occurs
verbatim in the CSS it is about to measure. A fixture whose classes were
renamed is reported `unmatched` and its readings are withheld — never published
as the initial values that a genuinely inert channel also produces.

**An unapplied stylesheet throws.** The first build of this harness used
`page.addStyleTag` and read immediately; one run in four returned
`border-radius: 0px` for a late fixture — the exact reading a real inert
channel gives. The bundle is now a real subresource behind a route handler so
`waitUntil: 'load'` cannot fire early, and two canary tokens must resolve
non-empty before any reading is taken. Six consecutive runs now agree.

**A dial run certifies itself.** Two roster fixtures read the dial with no
derived token in between. If they do not move, the artifact records
`controls: harness-suspect`, the CLI exits `1`, and the artifact says in its own
text that every inert verdict in it is void.

**A dial records a witness.** The dialled properties are read back at the
position they were written, so "the design system ignored this input" is never
confused with "the input never landed".

**The composition formula is checked against the repository's own.** The
formula drill runs `scripts/build/verticals/css-freshness/index.mjs` as a subprocess and
compares first-divergence lines. Writing that drill surfaced a second false
green worth knowing about: `node --test` sets `NODE_TEST_CONTEXT` on its
children, a nested runner that sees it stops emitting TAP, and the scan matched
nothing — which the drill would have read as "no divergence found". The variable
is stripped so the child always speaks TAP.

Every number carries its scope in the output itself. Readings are keyed
`vertical/theme/engine/arm` → `fixture/target` → property. There is no
scope-free total anywhere in the artifact.

### Fail-closed measurement guards

Every one of these exists because the same underlying accident — *nothing was
measured* — produces output indistinguishable from the most valuable finding
this instrument can produce: *the tenant's control reaches nothing here*. So
none of them warns. Each makes the run FAIL.

| guard | the accident it refuses to call a finding |
|---|---|
| `zero-match-selector` | a declared target matched zero elements, so its properties produced no reading |
| `absent-measurement` | a declared property produced no reading at all. An empty computed longhand is absence; an empty **custom** property is the browser answering, and is kept |
| `unhydrated-target` | the element is in the DOM but a layer canary token resolves empty ON IT, or every decidable declared property is at its declared initial value |
| `unhydrated-undecidable` | no declared property has a declared initial value and no canary was read, so hydration cannot be decided. Fails rather than guesses |
| `stale-source` | the owned files no longer hash to the digest the receipt claims. A missing digest on either side is unproven freshness, not proven freshness |

The unhydrated guard **extends the existing canary mechanism** rather than
adding a second one: the same `--ds-radius-md` / `--ds-radius-scale` tokens the
document-level guard already reads, read at a second position — on each measured
element. An element can be present while the inherited custom-property stream
never reached it, and that element reports initial values that look exactly like
a channel a tenant genuinely cannot move.

"Still at initial values" needs a table, and
`foundation/guards/initial-values/index.json` is it. A property absent from that table
is **undecidable**, never assumed: silently skipping it would reintroduce the
hole the guard closes. Properties whose computed value is a used value rather
than the initial keyword (`height`, `block-size`) are deliberately absent — a
declared `auto` would never match and would make the guard look present while
being dead.

---

## The radius-scale result, at HEAD 6a4a78b29

`dial --set --ds-radius-scale=1.5 --dial-target root`, `--bundle fresh`, three
verticals × two themes, controls **harness-live**, witness **landedEverywhere**,
totals **90 moved / 186 inert**:

| fixture | declared chain | platform | bithire | evnto |
|---|---|---|---|---|
| `skeleton-card-line` | `calc(4px * var(--ds-radius-scale,1))` | 4px → **6px** | 5px → **6px** | 4px → **6px** |
| `skeleton-form-action` | `calc(6px * var(--ds-radius-scale,1))` | 6px → **9px** | 7.5px → **9px** | 6px → **9px** |
| `card-modern-md` | ← `--ds-radius-lg` | 14px → **21px** | 10px → **12px** | 18px → **27px** |
| `button-modern-md` | ← `--ds-button-md-radius` | 10px → **15px** | 9px → 9px | 14px → **21px** |
| `input-modern-md` | ← `--ds-input-radius` | 10px → **15px** | 9px → 9px | 14px → **21px** |

14 of the 18 painted radius rows move. The **4 that do not are BitHire's button
and input, in both themes**, and the cause is not the radius ramp: BitHire's
compiled artifact flat-declares `--ds-button-md-radius: 9px`, `--ds-input-md-radius: 9px`
and `--ds-radius-input: 9px` at tenant scope, and those names sit BELOW the
`--ds-radius-md` derivation in the paint chain rather than above it. They come
from a second emitter — `chrome-variables` (`--ds-button-${size}-radius`,
`--ds-radius-input`), fed by `chrome.controls.*.geometry.radius` — which the
brand-theme `-base` repair never touched.

### `--dial-target fixture` cannot answer this question

Writing the dial inline on the measured element was documented here as "a
strictly stronger position than any tenant can occupy". **That was false, and it
produced a wrong verdict that stood for a whole wave.** `var()` inside a custom
property is substituted at computed-value time on the element where the
declaration applies; descendants inherit the already-substituted stream. So a
descendant write cannot re-derive a `:root`-declared token, and for derived
tokens `fixture` is strictly WEAKER than `root`.

Measured, same bundle sha, same HEAD, same dial:

| target | `card-modern-md` on evnto/light | totals |
|---|---|---|
| `root` | 18px → **27px** | 90 moved / 186 inert |
| `fixture` | 18px → 18px (**inert**) | 18 moved / 258 inert |

A strictly stronger position cannot yield strictly fewer movements. The 18 rows
that do move under `fixture` are exactly the three channels read on the same
element they were written on — the two skeleton `border-radius` literals and the
readout's own `--ds-radius-scale` — 3 × 6 cells. Everything else in that artifact
is structurally unable to move and its inertness means nothing.

**`root` is the position a real tenant occupies** and is the only target whose
inert verdicts transfer. The Standard `shape.radius-scale` control
(`appearance.general.shape.radiusScale`) compiles through `appearance-posture`,
which emits `--ds-radius-scale` and **no** `--ds-radius-*-base` — a bare scale in
a later block, multiplying the vertical's baked bases. That is exactly what a
root inline write models.

Two further readings the run produced, both of the kind only a resolution
instrument can produce:

- **BitHire's ramp is now self-consistent, and the readout says so.** Its
  artifact declares `--ds-radius-scale: 1.25` with `--ds-radius-md-base: calc(10px / 1.25)`,
  so the foundation calc reproduces the authored 10px today while leaving the
  multiplier live. The readout reads it back verbatim as
  `calc(calc(10px / 1.25) * 1.25)` — a token stream, not a length, which is why
  only the painted longhand settles anything.
- **The same token pair is an alias in two verticals and a fork in the third.**
  `--ds-button-md-radius: var(--ds-button-md-border-radius)` holds on platform
  (10/10) and evnto (14/14). On BitHire the pair reads 10px and 9px, and the
  button paints **9px** — the derived member is overridden directly, so the
  channel a tenant would be told to write is not the one that paints. This is
  the residue that keeps the radius dial from reaching BitHire's controls.

A `--bundle dist` run diffed against `--bundle fresh` shows **zero** changed
rows across this roster: the `dist` staleness is real, but it does not reach any
of the properties measured here.
