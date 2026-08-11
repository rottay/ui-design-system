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

---

## Run it

```bash
cd packages/core

# every vertical × theme × fixture, written to an artifact
node src/tooling/resolution-probe/public/cli/index.mjs run --out before.json

# turn one tenant dial and report exactly which painted properties moved
node src/tooling/resolution-probe/public/cli/index.mjs dial \
  --set --ds-radius-scale=1.5 --out dial.json

# what changed between two runs
node src/tooling/resolution-probe/public/cli/index.mjs diff before.json after.json

# the drills — run these before trusting a number this thing produced
node --test src/tooling/resolution-probe/public/drills/tests/index.test.mjs
```

Layers, in dependency order — every edge runs downward, and
`node scripts/core-structure-audit.mjs --check` is green with these files in
the tree:

```
foundation/  paths, scope (the root-attribute vocabulary), roster (+ fixtures.json)
runtime/     bundle (which CSS is authoritative), browser, measure
composition/ run (bundles × scopes × fixtures → artifact), diff
public/      cli (run | dial | diff), drills (+ tests)
```

Exit codes: `0` ran clean; `1` a fixture no longer matches the CSS, or a dial
run's own controls did not move; `2` bad invocation.

Nothing here is registered in `scripts/ci-gates.manifest.mjs`, and the drill
file is `.test.mjs` so the vitest project (`src/**/*.test.{ts,tsx}`) cannot
sweep it into the suite.

---

## Which CSS is authoritative

`dist/*.css` is what the npm tarball ships, so it looks like the obvious thing
to measure. Three facts complicate that:

1. **`dist/` goes stale, and nothing warns you when it has.** It is regenerated
   by a build, so between a compiler change and the next build the shipped
   bundle describes the previous tree. `node --test scripts/vertical-css-staleness.gate.mjs`
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

- **Anything that originates in React.** Recipe-profile prop defaults, the
  attributes a component decides to stamp at render, conditional `data-*`
  driven by props or state, inline styles a component computes. A CSS fixture
  states the DOM; it does not derive it. That is a second, smaller instrument.
  Consequence: this harness can prove a *rule* is dead, and can prove a rule
  paints value X for an element shaped Y — it cannot prove a component ever
  produces an element shaped Y.
- **The spring tail** under `--bundle fresh` (above).
- **Anything needing layout at more than one viewport.** One pinned viewport
  (1280×800, dpr 1). Responsive divergence is not in v1.
- **Engines other than the one asked for.** `--engine` defaults to `modern`;
  the engine scope class is stamped by components on their own roots, so
  engine-scoped paint is only visible where a fixture carries the class.
- **Font loading.** Subresources are aborted by the route handler, so
  `font-family` reads as the declared stack. Metric-dependent values
  (line box heights) reflect the fallback font.

---

## How it refuses to lie

Five mechanisms, each with a drill that has been seen to fail.

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
formula drill runs `scripts/vertical-css-staleness.gate.mjs` as a subprocess and
compares first-divergence lines. Writing that drill surfaced a second false
green worth knowing about: `node --test` sets `NODE_TEST_CONTEXT` on its
children, a nested runner that sees it stops emitting TAP, and the scan matched
nothing — which the drill would have read as "no divergence found". The variable
is stripped so the child always speaks TAP.

Every number carries its scope in the output itself. Readings are keyed
`vertical/theme/engine/arm` → `fixture/target` → property. There is no
scope-free total anywhere in the artifact.

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
