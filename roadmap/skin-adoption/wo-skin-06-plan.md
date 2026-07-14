# WO-SKIN-06 — execution plan

Written after six of the ten checkpoints were inventoried (CK-A, B, C, D, F, G; E/H/I in flight).
It **replaces the decomposition in `wo-skin-06-triage.md` §6**, which was built on a premise the
inventories destroyed.

## What the triage got wrong, and why it matters

§6 grouped the 3,582 sites into clusters "by shared paint vocabulary" so that "one skin kills the
most duplication". **Every cluster inventoried so far has falsified that premise:**

| cluster | claimed | measured |
| --- | --- | --- |
| CK-C workspace chrome | "the single biggest shared-vocabulary cluster" | 2 of 11 components adopt the canonical tokens; nine hand-rolled divergent recipes |
| CK-D forms + record | "one form/section/step vocabulary" | the named helpers are PRIVATE to one file; six independent per-component maps |
| CK-F communication | "feed/thread/bubble vocabulary" | six skins, zero cross-component imports — and in three components the TWO ENGINES of the same component disagree with each other |
| CK-G navigation patterns | "menu/palette/switcher vocabulary" | five skins, zero cross-component imports |
| CK-B headers | "the tone map is duplicated across edit/form/detail" | edit and form are byte-identical; **detail only LOOKS like a copy — every numeric value diverges** |
| CK-A dashboard | (no vocabulary claim) | 4 independent vocabularies; only metrics/tokens.ts is genuinely shared and cleanly imported |

The root cause is the same every time: **sharing was inferred from similarity.** Components that
solve the same problem in the same house style, with the same `color-mix()` idiom, LOOK like they
share a vocabulary. Nobody grepped for importers before the clusters were drawn.

**The operational consequence, and it is the whole point of this document:** a migration agent told
"these files share a vocabulary, so one skin covers them" will do one of two bad things — flatten
real differences (moving pixels inside a byte-exact migration, which is forbidden) or waste its
context discovering, file by file, that the premise was false. **Expect ONE TOKEN SET PER
COMPONENT.** Unification is a separate, deliberate design pass with its own baselines.

## What the clusters ARE

They remain the right **sequencing** unit: they group work that shares a review context, one build
cycle, one certification pass, and one contract. They are not a skin-sharing unit. Rename the
mental model: a cluster is a *batch*, not a *skin*.

## Revised sequencing

Ordered by (value per unit of risk) × (readiness), not by size:

| # | cluster | sites | skins | why here |
| --- | --- | --- | --- | --- |
| 1 | **CK-D** forms + record + workflow | 591 | ~6 | The cleanest cluster in the program: 589/591 category A, ZERO DaisyUI coupling, ZERO bridge rules (no legacy layer to reconcile — a first). Mechanically simple; ideal to run the new 3-parallel-migration pipeline on. Split D1 = patterns/forms, D2 = record + workflow + surfaces/pages/forms. |
| 2 | **CK-B** headers | 334 | ~4 | Edit/Form share a byte-identical tone map + gradient recipe (ONE skin covers both, proven). Detail needs its OWN token set (same shape, every value diverges). page-shell/cockpit/workbench each own theirs. Zero imperative writes. |
| 3 | **CK-A** dashboard widgets | 439 | ~4 | Highest-value chrome. **NO LONGER BLOCKED** (2026-07-13): the variant-pinning "harness" turned out to be an existing `variant` prop that already wins over the random pick — three lines of fixture, not machinery. metrics/tokens.ts is genuinely shared (48 exports, cleanly imported by all 4 metrics variants) — the only real shared vocabulary found so far. |
| 4 | **CK-G** navigation patterns | 279 | 5 | environment-toggle carries 20 of the program's 46 hatch sites. 10 LIVE imperative writes in command-palette, all must be transcribed. |
| 5 | **CK-F** communication | 271 | 6 | Two components (assistant, presence) are not engine-split and are structurally unlike the rest. |
| 6 | **CK-C** workspace chrome | 466 | ~9 | 28 imperative writes (the densest in the program), 3 portaled components, and the highest STATE-SELECTED share (~40%) — mostly interactive chrome. Budget against the interaction work, not the site count. |
| 7 | **CK-H2** misc | ~216 | ~5 | ~100% category A. |
| 8 | **CK-I** long tail | 397 | 38 | Certified across 43 scoped files; 381 true DOM-paint sites moved and permanent exclusions preserved. |
| 9 | **CK-H1** tenant/branding previews | 235 → 45 | 4 | Certified after recovery: 190 static sites moved; 37 runtime-paint and 8 non-paint identities remain exact. |
| 10 | **CK-E** visualization | 478 → 111 | pending | Final checkpoint: 299 inline + 179 runtime-SVG sites; 367 migrate and 111 exact Stage-1 floors remain. |

## The two pieces of machinery that must land before their dependents

### 1. The category-B ratchet exemption (`SKIN-EXEMPT-RUNTIME-VALUE`)

The per-file registry now measures every site whose paint value IS runtime data: tenant/branding
previews (their job is to render a colour the user picked), charts' per-datum/per-series colours,
and presence's per-user identity colours.
A skin rule cannot hold these, and emitting one custom property per swatch or datum would be
strictly worse code than the inline value. They are **not pending work** — carrying them as debt
that can never reach 0 is a lie in the ratchet. Name the exemption, list the sites exactly (the
inventories give exact counts), and gate on it. The machinery is certified; CK-H1 is complete and
CK-E is its remaining consumer.

### 2. ~~The variant-pinning harness (blocks CK-A)~~ — RESOLVED 2026-07-13, CK-A IS NOT BLOCKED

`data-terminal-card` picks 1 of 4 card bodies at RANDOM per mount, and the four bodies are not
exported — the `variant` prop is the only door. Without pinning, a byte-exact baseline is noise.

**There is no harness to build. The door is already open, and nobody tried it.** Read at
`data-terminal-card/index.tsx:862-866`, the precedence is explicit:

```ts
const variant = useMemo(() => {
  if (propVariant) return propVariant;      // <- an explicit prop WINS, deterministically
  if (contextVariant) return contextVariant; // <- DataTerminalCardProvider pins a whole page
  return getPageVariant();                   // <- only then the random/SSR-mismatched fallback
}, [propVariant, contextVariant]);
```

So the "harness" is: render four instances, `variant={1}` through `variant={4}`, in the pre-step
fixture — or wrap a section in `<DataTerminalCardProvider variant={n}>`. All four bodies
(`CommandCard`, `HUDCard`, `CircuitCard`, `MatrixCard`) are reachable through the switch at line 872.
Three lines of fixture, not a piece of machinery.

**CK-A is unblocked and should be scheduled on its merits** (439 sites, the highest-value chrome in
the program). This is the CK-C lesson running backwards: there, a capability was assumed to be shared
and was not; here, a capability was assumed to be missing and was already there. **Measure, then
contract — in both directions.**

P-77 still stands and is untouched by this: `getPageVariant()` returns 1 on the server and rolls
`Math.random()` on the client, so every unpinned `DataTerminalCard` hydration-mismatches in every SSR
app today. Pinning the fixture does not fix the product; it only makes the baseline honest.
(`dashboard-insights`' `useVariant` has the same shape but ZERO callers — its 8 renderers are
individually exported and directly mountable, so the trap is inert there. Do not "fix" it by wiring
it up.)

## The traps that recur across clusters (bake into every contract)

1. **`data-part` is a shared VOCABULARY, not an identifier.** Anchor every rule — and every test
   query and every visual probe — to the component's own scope class. This has drawn blood four
   times: a visual probe silently widened; a component inherited a published sibling's skin; an
   ARC-09 suite went red when a composed child got stamped; and Box nearly stamped `root` onto every
   nested Box in the fleet.
2. **A numeric literal glued to a colour is an ALPHA BYTE, not a percentage.** `color + '15'` is
   8.24%, not 15%. "Modernizing" it to `color-mix(… 15%)` nearly doubles the tint.
3. **Local `@keyframes` shadow globals of the same name, and the local one WINS** (last parsed).
   `live-feed`'s local `pulse` (0.4) deliberately differs from the global (0.5), and the same shape
   recurs in five other files. Deleting the "duplicate" changes the animation everywhere.
4. **The same imperative `.style.x =` mechanism is LIVE in one component and DEAD in another.**
   Never pattern-match; check, per write, whether anything competes with it. Deleting a live one
   breaks an interaction that no baseline photographs.
5. **Two engines of one component can read two different token vocabularies for the same slot**
   (command-palette), or classify the same input with different LOGIC (activity-log). Consolidating
   either changes what a tenant override reaches. Preserve both; flag as a product question.
6. **P-76**: every theme.css / personality.css bridge on `border-width`, `margin`, `padding` is DEAD
   (preflight outranks every rottay-* layer). NEVER revive one — reproducing its value in an
   unlayered skin makes it paint for the first time. `color`, `background-color`, `box-shadow`,
   `border-radius`, `border-color` are LIVE. An app-level `!important` beats everything, including
   an unlayered skin.
7. **The counter is not the coverage checklist — the INVENTORY is.** It is blind to string contents
   (`@keyframes`, per-instance `<style>` tags), to `.style.x as any =`, and to SVG presentation
   attributes. Three of its bugs were found and fixed in one session, all by agents reconciling a
   hand count against it. Keep demanding that reconciliation; the delta is the signal.
