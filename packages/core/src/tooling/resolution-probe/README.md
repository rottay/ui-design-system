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

1. **`dist/` is stale.** `node --test scripts/vertical-css-staleness.gate.mjs`
   recomposes the five committed bundles from source and **fails on all five**
   (`styles/{platform,rottay,bithire,evnto,index}.css`). Platform first diverges
   at line 77.
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
staleness gate as a subprocess and compares where each side says the shipped
bundle diverges. They agree exactly today — platform **77**, bithire **155**,
evnto **77**.

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

## The v1 result

`dial --set --ds-radius-scale=1.5`, `--bundle fresh`, three verticals × two
themes, controls **harness-live**:

| fixture | declared chain | platform | bithire | evnto |
|---|---|---|---|---|
| `skeleton-card-line` | `calc(4px * var(--ds-radius-scale,1))` | 4px → **6px** | 5px → **6px** | 4px → **6px** |
| `skeleton-form-action` | `calc(6px * var(--ds-radius-scale,1))` | 6px → **9px** | 7.5px → **9px** | 6px → **9px** |
| `card-modern-md` | ← `--ds-radius-lg` | 14px → 14px | 10px → 10px | 18px → 18px |
| `button-modern-md` | ← `--ds-radius-md` | 10px → 10px | 9px → 9px | 14px → 14px |
| `input-modern-md` | ← `--ds-radius-md` | 10px → 10px | 9px → 9px | 14px → 14px |

The dial is **live for direct consumers and inert for every derived-token
consumer**, on all three verticals, in both themes. The cause is visible in the
`token-readout` fixture: `--ds-radius-md-base` is `8px` and `--ds-radius-scale`
is `1`, yet `--ds-radius-md` resolves to `10px` — because each generated
vertical artifact flat-declares `--ds-radius-{sm,md,lg,xl}` at the tenant scope,
*above* the `calc()` derivation in the base layer.

Re-run with `--dial-target fixture`, which writes the property inline on the
measured element — a strictly stronger position than any tenant can occupy —
and the card/button/input radii still do not move. No tenant configuration
anywhere can move them through `--ds-radius-scale`.

Two further readings the run produced, both of the kind only a resolution
instrument can produce:

- **BitHire declares a dial it contradicts.** Its artifact sets
  `--ds-radius-scale: 1.25` *and* flat radii that are not `base × 1.25`
  (`sm` 7px vs 7.5, `lg` 14px vs 15, `xl` 18px vs 20). The declared dial and the
  painted values disagree by construction.
- **The same token pair is an alias in two verticals and a fork in the third.**
  `--ds-button-md-radius: var(--ds-button-md-border-radius)` holds on platform
  (10/10) and evnto (14/14). On BitHire the pair reads 10px and 9px, and the
  button paints **9px** — the derived member is overridden directly, so the
  channel a tenant would be told to write is not the one that paints.

A `--bundle dist` run diffed against `--bundle fresh` shows **zero** changed
rows across this roster: the `dist` staleness is real, but it does not reach any
of the properties measured here.

A `--bundle dist` run diffed against `--bundle fresh` shows **zero** changed
rows across this roster: the `dist` staleness is real, but it does not reach any
of the properties measured here.
