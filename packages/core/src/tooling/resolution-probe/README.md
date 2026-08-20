# resolution-probe

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
node src/tooling/resolution-probe/public/cli/index.mjs run --out before.json

# turn one tenant dial and report exactly which painted properties moved
node src/tooling/resolution-probe/public/cli/index.mjs dial \
  --set --ds-radius-scale=1.5 --out dial.json

# baseline -> mutation -> removal, both ingress doors, one scene. NO --payload:
# this command calls loadCompilerArms() + lowerStop() itself and imports the
# REAL compiled compilers from dist/ -- it never accepts a variable map from
# the outside. Every --bind target must be a real "fixtureId/targetId" pair
# from FIXTURE_IDS, enforced mechanically at parse time.
node src/tooling/resolution-probe/public/cli/index.mjs causal \
  --control-manifest scripts/quality-evidence/programs/modern-rescue/manifest/controls/spacing.rhythm.json \
  --family-manifest scripts/quality-evidence/programs/modern-rescue/manifest/families/primitive/layout/flex.json \
  --stop airy --vertical platform \
  --bind control-height-fixed=button-modern-md/hitbox --out causal.json

# what changed between two runs
node src/tooling/resolution-probe/public/cli/index.mjs diff before.json after.json

# the tenant-less document — base + engine, no artifact, no tenant attributes
node src/tooling/resolution-probe/public/cli/index.mjs run --vertical none --out base.json

# the drills — run these before trusting a number this thing produced
node --test src/tooling/resolution-probe/public/drills/tests/index.test.mjs   # needs a browser

# the causal mechanics — pure, fast, no browser
node --test src/tooling/resolution-probe/foundation/causality/tests/index.test.mjs
node --test src/tooling/resolution-probe/foundation/guards/tests/index.test.mjs
node --test src/tooling/resolution-probe/foundation/negative-controls/tests/index.test.mjs
node --test src/tooling/resolution-probe/runtime/ingress/tests/index.test.mjs
node --test src/tooling/resolution-probe/composition/run/tests/index.test.mjs
node --test src/tooling/resolution-probe/composition/receipt/tests/index.test.mjs
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
`node scripts/structure/core-structure-audit/index.mjs --check` is green with these files in
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

Nothing here is registered in `scripts/ci/ci-gates.manifest/index.mjs`, and every test
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
vitest run --project unit src/tooling/resolution-probe/foundation/roster/tests
```

---

## Which CSS is authoritative

`dist/*.css` is what the npm tarball ships, so it looks like the obvious thing
to measure. Three facts complicate that:

1. **`dist/` goes stale, and nothing warns you when it has.** It is regenerated
   by a build, so between a compiler change and the next build the shipped
   bundle describes the previous tree. `node --test scripts/verticals/vertical-css-staleness.gate/index.mjs`
   is the authority on which regime you are in: it recomposes the five committed
   bundles from source and names the first diverging line of each. It has been
   red on all five (platform first diverging at line 77); at HEAD 6a4a78b29 it
   is green. **Do not pin either answer** — ask the gate.
2. **`styles/` is not a second opinion.** This harness verifies it is
   byte-identical to `dist/` — which is exactly what `build-vertical-css.mjs`
   promises. A drill asserts it.
3. **The artifact builders read `dist/` themselves.** A stale dist and a stale
   artifact agree with each other, and every gate downstream of them passes.

So the default is `--bundle fresh`: recomposed in memory from
`src/foundation/tokens/css/**` using the same formula as the staleness gate
(postcss + `@tailwindcss/postcss` on the modern engine, recursive `@import`
inlining for base and tenant, font packs ahead of base). No build step.

`--bundle dist` and `--bundle styles` are available and are labelled
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

**What `fresh` cannot produce:** `build-vertical-css.mjs` appends a per-tenant
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
  roster is no longer radius-only: `foundation/roster/fixtures.json` declares
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
  and `producedBy` always come from `compileBrandTheme`/`compileAppearanceVariables`, never from a
  JSON file a caller could have hand-written. `lowerStop` also reshapes the manifest-path-relative
  document into the argument shape each compiler function ACTUALLY takes, verified against
  source: `compileAppearanceVariables(appearance: TenantAppearance)` destructures
  `appearance.general` immediately, so it needs `document.appearance`, not the DB document's own
  `{appearance:{general:{…}}}` wrapper the old harness handed it (that mismatch was the harness
  reporting its own bug as a design-system defect); `compileBrandTheme(input: BrandCompilerInput)`
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

### Two ingress doors, one scene

A control has two doors, and they land in **different positions in the
cascade**:

| arm | door | lands as | compiler |
|---|---|---|---|
| `static-brand-theme` | `surfaces.rhythm` | a block behind `:is(html[data-tenant='…'], :where([data-ds-root][data-vertical='…']))` | `compileBrandTheme` |
| `db-tenant-theme` | `appearance.general.rhythm` | `setProperty` on `document.documentElement` | `compileAppearanceVariables` |

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

### Negative controls come from the manifest, not from here

`manifest/controls/<id>.json#calibration.negativeControls` owns WHICH negative
controls apply; `manifest/families/<id>.json#themeControls[].negativeControls`
narrows them onto one family root, and the effective set is the union — a silent
family inherits the full control list rather than escaping it.

`foundation/negative-controls/vocabulary.json` owns only the MEASURABLE
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
owns a validator (`scripts/quality-evidence/v2/receipts.mjs`) and
`evidence-contract.json` already states the law, so a second validator would be
a second authority — two that agree teach nothing, two that disagree need a
third.

What the emitter adds is the half nobody else can compute: **the instrument is
part of the source**. `sourceFiles` is the union of the measured files and every
production file under `src/tooling/resolution-probe/` (tests excluded — a test
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
formula drill runs `scripts/verticals/vertical-css-staleness.gate/index.mjs` as a subprocess and
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
`foundation/guards/initial-values.json` is it. A property absent from that table
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
