# Token Manifest — specification

The normative reference for the token system. It records **what is** (measured) and **what must be**
(declared). The difference between the two is the wave backlog: the roadmap is derived from this
document, not written beside it.

Status: specification, agreed in principle. Not yet generated.

---

## 0. How to read this document

### 0.1 Evidence classes

Every number carries one:

| Tag | Meaning |
|---|---|
| **[M]** | MEASURED — produced by a script over a stated corpus, reproducible |
| **[D]** | DECLARED — a human wrote it; a gate checks it against measurement |
| **[O]** | OPEN — owner decision required; nothing downstream may assume an answer |

### 0.2 The two laws that govern the artifact

**Law 1 — the IS layer may contain only measured data. Declarations feed the MUST BE layer only.**

> If the IS layer copies declarations instead of measuring, the drift does not disappear — it gets a
> `generatedBy` header and stops being questioned. That is strictly worse than a hand-authored
> ledger, which at least everyone distrusts.

This is not a style preference. Four hand-authored ledgers in this repo have drifted; every generated
one is clean. And `derivedChannels`, the existing declaration of control impact, has been proven
wrong four times while carrying the authority of a contract.

**Law 2 — ownership is declared and single; reach is measured and plural.**

The owner's rule is that a token must reach many families. The governance rule is that nothing may
have two owners. These are not in tension once they are separated onto different axes: `family` is a
declared single owner; `reaches[]` is a generated relation from the read graph. Uniqueness is enforced
on ownership only, so reach can grow without weakening any gate.

### 0.3 Scope of every measurement below

`packages/core/src` only. **Reader counts are DS-internal**: `app-bithire`, `app-evnto` and
`app-platform` are not in this repository, so a count of zero never proves a name is unused.
Interpolated reads (`var(--ds-color-${role}-${step})` and similar, 217 production sites) are invisible
to text scans, so **every read count is a floor**. Whole generated blocks — the ~180-name material
family, the 81-name colour grid — are reached only this way.

---

## 1. The system as it is

### 1.1 Nine declaration layers **[M]**

| # | Layer | Distinct names | Declared in |
|---|---|---:|---|
| 1 | Raw ramps | 594 | `foundation/base/*` (6 files) |
| 2 | Semantic role channels | 1,075 | **one file**: `foundation/themes/default.css` |
| 3 | Component channels | 1,949 | `presentation/components/*.css` (28) |
| 4 | Family skin | 124 | `presentation/components/skin/*.css` (30) |
| 5 | Engine skin | 214 modern / 4 rustic | `runtime/engines/*/skin/*.css` |
| 6 | Generated vertical artifacts | 1,910 (577 exclusive) | `facade/artifacts/*` |
| 7 | Private `--_ds-*` | 310 | co-located |
| 8 | Framework projection | 28 | `framework-token-projection.css` |
| 9 | Runtime TS channels | ~356 | `tokens/ts/`, `ui/**` |

Two facts about the writer side that shape the governance design:

- **The engine skin layer AUTHORS.** 182 of the 214 modern-skin names are declared in no other layer.
  A family lane does not merely override channels — it mints them, today without a guard.
- **Layers 3, 4 and 5 are not reachable through `tokenOverrides`** (a closed 71-name allowlist), but
  they *are* reachable through `chrome`, which kebab-cases chrome objects into `--ds-*` names.

### 1.2 The tenant surface **[M]**

| | |
|---|---:|
| Writable leaves, `mode: "simple"` | 36 |
| Writable leaves, `mode: "advanced"` | 1,804 |
| Hard cap: compiled variables | **512** |
| Hard cap: `tokenOverrides` entries | **200** of a closed 71-name allowlist |
| The Management writes today | **67 leaves** (35 of them `tokenOverrides`) |

**`tokenOverrides` values are NOT clamped.** Only `--ds-density-scale` and `--ds-effect-intensity`
carry range checks. `--ds-radius-{sm,md,lg,xl}` are on the allowlist, so a Pro tenant can already set
`--ds-radius-md: 0px` today. **The envelope binds the Standard dials, not the Pro path.**

### 1.3 Where the range actually is **[M]**

| Axis | Enough range to read as a different company? | Limited by |
|---|---|---|
| Font family | **yes — the largest lever available today** | nothing; already open |
| Border / edge weight | yes | **plumbing** — 12% reach, 1,399 literal widths |
| Elevation / depth | yes | **plumbing** — 546 hand-rolled shadows bypass the ramp |
| Geometry | yes on Pro, **no** on Standard | both, differently |
| Iconography | yes | **plumbing** — 167 raw `strokeWidth` bypasses |
| Anatomy | yes — 12 declared variants | **plumbing** — honoured by 9 of 252 families |
| Density | no | **contract** — CSS permits 0.5–3.0, the envelope 0.85–1.15 |
| Type scale | no | **contract** — ±8% |

> **Only density and type scale need the contract widened. Everywhere else the contract already
> permits more than the CSS can deliver.**

### 1.4 Tokenisation is not the problem **[M]**

16,715 governed declarations in family-owned CSS; **1,515 (9.1%) are pure literal**. The system is
**91% tokenised**. The gap is that tenant *controls* do not reach the tokens.

One file holds 21% of all pure literals: `presentation/components/skin/oauth-transition.css`
(2,248 lines, 315 literals). Repairing it alone moves the global rate to 7.2%.

### 1.5 Known-dead and known-broken **[M]**

- **`shape.button-style` is dead on the Standard path.** It writes `--ds-radius-button`, which has
  zero production readers. The Pro path writes both that and `--ds-button-{size}-radius`, which is
  read. **A Pro customer can make pill buttons; a Standard customer cannot.**
- **`shape.radius-scale` is inert on all three verticals.** `styles/bithire.css` declares *both*
  `--ds-radius-lg: 14px` and `--ds-radius-lg: calc(var(--ds-radius-lg-base) * var(--ds-radius-scale,1))`.
  **The raw literal is a cascade override, not a missing token.** The repair is to emit per-vertical
  `--ds-radius-*-base = flat ÷ scale`, not to delete the flat values — deleting them is not
  value-preserving (evnto's scale is 1, so its radii would drop from 10/14/18/24 to 6/8/12/16).
- **Three expressive values expand to nothing**: `motif: dots | deco-fan | ambient-orbs`. `motif` as
  a whole reaches one family.
- **DaisyUI is dead**: 0 class consumers by AST over 137 modern files, 0 bare-class renders across
  all three apps, no app dependency, no `@plugin`/`@import` in the CSS pipeline.

### 1.6 Axes with no token at all **[M]**

| Missing axis | Would reach | Why it matters |
|---|---:|---|
| **Font weight** | 154 families (61%) | The strongest greyscale identity signal, and nothing writes it: no axis, no override token, no dial |
| **Focus / selection** | 95 families (38%) | 385 read sites, no control of any kind |
| **Control size** | 88 families (35%) | Welded to density today, so a "spacious" tenant gets airy layout with identical button heights |
| **Rhythm** | 78 sites → ~199 | Token, two-tier split and doc comment all exist; not in the allowlist and no envelope range. A written mechanism with no tenant surface |

---

## 2. The control set — what must be **[D]**

Eleven controls replacing today's twenty. This is a **consolidation**: the current set contains
duplicates that the "nothing means the same thing twice" rule forbids — `shape.button-style`,
`shape.radius-scale` and the `geometry` axis all steer radius; `density.mode`, `spacing.rhythm` and
the `density` field overlap; `experience.profile` and `profiles.expressive` are two mechanisms doing
one thing.

| Control | Tier | Named stops | Absorbs |
|---|---|---|---|
| `brand.color-seeds` | free | — (colour set) | unchanged |
| **`shape.geometry`** | free | **sharp · soft · rounded · pill** | `shape.button-style`, `shape.radius-scale`, geometry axis |
| `layout.density` | free | compact · standard · spacious | `density.mode`, `spacing.rhythm`, density field |
| `surface.edge` | free | borderless · hairline · outlined · ruled | edge axis |
| `surface.depth` | free | flat · paper · soft-depth · dramatic | `material`, `elevation`, `effect-intensity`, `elevation-posture` |
| `type.voice` | free | sober · editorial · humanist · geometric | `typography.pairing` |
| `motion.energy` | free | calm · standard · lively | `motion.dial` |
| `type.foundations` | premium | graded ±8% + stack choice | `typography.families`, `typography.scale` |
| `iconography.style` | premium | linear · strong-outline · duotone · solid-active | `profiles.icon` |
| `chrome.suite` | premium | per-surface bundles | `navigation.sidebar-tone`, `chrome.families`, `chrome.anatomy` |
| `surface.motif` | premium | none · micro-grid · pinstripe · contour | background patterns |

**Retired as controls, surviving as data**: `experience.profile` and `profiles.expressive` become
named **preset bundles** — positions of all dials at once. Keeping either as a control would be a
third mechanism. `token-overrides` demotes to `internal`. `responsive.posture` stays a Pro capability
but leaves the brand dictionary: it governs layout capacity, not brand expression.

### 2.1 Why the envelope does not need widening

> **The differentiation budget lives in the categorical channels, which the envelope does not touch.**
> Two companies at radiusScale 1.1 with different `buttonStyle` / `edge` / `pairing` read as different
> companies in greyscale. Two at 0.85 versus 1.2 with identical keywords do not.

`buttonStyle: sharp | soft | pill` switches **which radius channel a button reads** — `pill` is
fully-round on buttons only. That is a categorical jump the ±20% clamp cannot suppress, and it is what
makes `sharp` able to express the square corner the numeric dial cannot reach.

The single widening proposed: `radiusScale` per-vertical maximum from 1.2 to 1.25 — already the global
cap — so interpolation has headroom before the keyword flips to `pill`.

### 2.2 Graded scales, concretely **[D]**

Each dial is a scalar `t ∈ [0, k−1]` over `k` named stops at integer positions. Tenants store `t`;
presets are the integers. Compilation is static per `t`.

| Channel type | Rule |
|---|---|
| Numeric (scales, lengths, opacities) | **lerp** between adjacent stops. Results are convex, so they pass the same envelope validation as authored values |
| Keyword / enum / font stack | **nearest-stop ownership**, flipping at the midpoint. Deterministic and diffable |
| Untyped, or missing at one stop | **compile error** — never a silent hold |

The third rule is the anti-drift mechanism, and it is required: expansion variables are emitted as
`Record<string, string>`, so the compiler cannot today distinguish `"0.5px"` from a keyword.
**Interpolation requires a channel-type registry.** Without the totality rule, partial tables such as
`motif` — whose three valueless stops have no expansion rows at all — would interpolate into silently
disappearing channels.

**What breaks and must be repaired first:** `assertExpressiveEdgeWidthInvariant` is fail-closed against
a hand-written width table and will reject interpolated widths until it is re-derived from the scale
definition. Golden tests pinning exact expansion values must move to per-stop plus midpoint assertions.

### 2.3 The cross-vertical trap **[M]**

`effectIntensity` maxes at 0.65 for bithire and 0.75 for evnto, and out-of-range is **rejection, not
clamping**. A dial position whose interpolated value lands at 0.70 **compiles for evnto and throws for
bithire** — the same stored document becomes vertical-dependent.

**Scales are therefore defined against the INTERSECTION of the vertical envelopes**, with per-vertical
slack resolved by the compiler, never by rejection.

---

## 3. The taxonomy **[M] + [D]**

Three axes. Two are derived; exactly one is declared.

| Axis | Values | Source | Why |
|---|---|---|---|
| **Property group** | 17 (colour-fg, colour-bg, colour-border, border-geometry, radius, elevation, typography, spacing, sizing, motion, …) | **derived** from read sites | 78% of read tokens already land in exactly one group; a declared field would drift against the CSS that proves it |
| **Scope** | ramp · role · component-channel · engine-skin · family-skin · generated-facade · private | **derived** from declaration site | Declaration site predicts fan-out almost deterministically |
| **Family** | ~250–300 ids | **declared — the only human field** | Neither name nor reader can produce it: readers are aggregators, and one engine theme file alone dominates 165 name-families |

### 3.1 Why the name cannot be the family **[M]**

| | |
|---|---:|
| Natural clusters, by who reads a token | **250** |
| Families the name produces | **1,036** (50.5% singletons) |
| Tokens read **only** by units unrelated to their name stem | **37.1%** |
| Correlation, name-family ↔ property group (NMI) | **0.352** |
| Median own-family read share, across 366 units | **18.2%** |

**The decisive precedent.** `hooks-manifest.json.declaredSlots` is the only place a human has ever
declared a family — 93 hooks. It equals the name-derived family **0 times out of 93**. Seven of its
fifteen families *merge* between two and eight name-families; **zero** name-families split across
declared families.

> Where a human declared, the name was **always too fine and never too coarse**. The migration is
> therefore merge-only — the mechanically safe direction.

### 3.2 The declaration is ~250 file headers, not 4,600 entries **[D]**

4,164 tokens are declared across ~250 declaration units, and **no token is declared in more than one
unit within a layer**. So family is declared per **block**, and every token inside inherits:

```css
/* @ds-family select
   @ds-anatomy primitive/inputs/select     <- must resolve in family-ledger.json
   @ds-scope component-channel */
:where(.ds-select) {
  --ds-select-dropdown-bg: …;
}
```

Multi-layer declarations resolve by scope precedence; an unresolvable pair is a gate failure, never a
silent pick.

### 3.3 Invariants — four kept, three rejected **[D]**

| # | Invariant | Verdict |
|---|---|---|
| **I1** | Exactly one declared owner per token, from the declaration block, never the name | **keep** |
| **I2** | **No two families own the same (property-group, slot) pair at the same scope** | **keep — this is the anti-duplication mechanism** |
| **I3** | Every token in a family has ≥1 reader inside that family's own anatomy | **keep** — catches the dead-channel class |
| **I4** | A token's reads are ≥90% one property group | **keep** — 79.5% already pass |
| — | *One canonical authority per family per property group* | **reject** — false by construction: median 2 tokens per cell, max 69. A card legitimately owns bg, header-bg, section-bg, footer-bg. **Applying this at the wrong grain is why the generated catalog labels two rival border families `canonical-authority`** |
| — | *Every family reachable by a tenant control* | **reject at family level** — only 1,540 of 4,164 are tenant channels. Re-scoped: every **role-scope** token must be tenant-reachable |
| — | *A family spans ≥N components* | **reject** — 24% of natural clusters hold exactly one token |

I2 was tested against the six duplicate vocabularies shipping today. **All five testable pairs would
have been blocked at birth.**

**Before I4 is switched on**: 472 tokens (15.7%) are pure relays, read only into another custom
property and never touching a CSS property. They classify as `custom-prop-chain` and would fail I4 for
the wrong reason. Their property group must be resolved transitively through the derivation graph first.

---

## 4. The naming law **[D]**

```
--ds-<family>-<element>*-<variant>*-<property>-<layer>?-<state>?
```

`family` and `property` required; `element` repeatable; **`variant` precedes `property`** — argued from
`--ds-avatar-lg-border-width`, where `lg` scales the avatar, not the border-width.

`family` is a **registry with longest-match**, not "the first segment": there are 214 distinct first
segments but real families are multi-word (`font-size`, `z-index`, `active-filters-bar`).

Closed vocabularies, each word in exactly one:

| Vocabulary | Members |
|---|---|
| STATE | hover, active, focus, disabled, selected, checked, visited, expanded, loading, dragging, rest |
| SCALE | 2xs…9xl, full, none |
| LAYER | base |
| AXIS | inline, block, start, end |
| ROLE | primary, secondary, accent, neutral, success, warning, error, info |
| RANK | canvas, sunken, raised, overlay, inset |

### 4.1 The ambiguity killer

> Disjoint closed vocabularies + fixed slot order ⇒ **`canonical(name)` is a pure function of the
> segment multiset.** Two orderings of the same multiset normalise to the same name, so the second is a
> duplicate declaration. The collision becomes **unrepresentable**, not discouraged.

The gate requires `canonical()` to be injective over the corpus.

**The concrete fix for `--ds-color-bg-primary` vs `--ds-color-primary-bg`**: the overloaded words are
`primary`/`secondary`/`tertiary`, which live in RANK *and* ROLE. Proof they are the same thing — in
`styles/rottay.css` dark, `--ds-color-bg-primary` and `--ds-color-bg-canvas` are byte-identical.
**Reserve primary/secondary/tertiary to ROLE; rank uses canvas/sunken/raised/overlay/inset.**

### 4.2 Four "synonyms" that are not **[M]**

Do not merge these. Each merge would be a semantic error:

| Pair | Why they differ |
|---|---|
| `space` / `spacing` | `--ds-space-*` is the **Space component**, not a scale |
| `shadow` / `elevation` | Elevation is a **level ramp**; shadow is the property that renders a level. Only 4 names are genuine misuses |
| `border` / `stroke` | All 9 `stroke` names are SVG, where `stroke` **is** the property |
| `disabled` / `inactive` | `inactive` means *unselected* |

Real, and previously missed: **`-padding-x` (67) vs `-padding-inline` (63)**. Winner `inline`/`block`,
because `x`/`y` are wrong under `dir=rtl`. A correctness argument, not a vote.
`bg` beats `background` because `background` is also the CSS shorthand property; the word is reserved.

### 4.3 The permutations are not renames **[M]**

Of 99 permutation groups compared inside the same bundle:

| Class | Groups | Action |
|---|---:|---|
| **Hard fork — both declared, different values** | **48** | **NOT a rename.** Merging changes rendering. Owner adjudication, one by one |
| Alias bridge (one is `var(other)`) | 13 | safe: retire the alias, repoint readers |
| Same value | 7 | safe merge |
| Never co-declared | 44 | safe after a per-vertical check |

Samples: `--ds-tooltip-z-index` 1070 vs `--ds-z-index-tooltip` **1700**; `--ds-card-md-padding` 1rem vs
`--ds-card-padding-md` 1.25rem; `--ds-checkbox-md-size` 1.125rem vs `--ds-checkbox-size-md` 1rem.

### 4.4 The ratchet — day-one debt is 718, not 4,600 **[M]**

| Rule | Violations today | Day one |
|---|---:|---|
| R1 state word terminal | 497 (292 active) | baseline, decrease-only |
| R2 variant precedes property | 221 (145 active) | baseline, decrease-only |
| R3 every segment in a registered vocabulary | 214 first segments to seed | baseline the unknown set; **a new unknown word fails** |
| R4 `canonical()` injective | 99 group keys | baseline; **a new group fails** |

Nothing existing must move. A new violating token fails immediately.

### 4.5 What is never a textual substitution

| Class | Scope | Why |
|---|---|---|
| Interpolated names | 217 production sites | Invisible to scans **and** to codemods. Fix the TS template, never the CSS |
| Hand-adjudicated ledgers | 6 files, 4,688 rows | A rename orphans a row; the new name re-enters unadjudicated |
| Name-keyed gate baselines | 3 files, 707 entries | A rename reads as one removed + one added; **a decrease-only ratchet nets it to zero and hides it** |
| Shipped public surface | dist CSS + `hooks-manifest.json` in `files[]` | Every declared name is app API. **229 names have zero DS reads** — exactly where an app-side reader is invisible |

---

## 5. The artifact **[D]**

### 5.1 Shape: edge-rooted, three tables, two emitted views

Neither control-rooted nor token-rooted: the frontend needs token→primitive, governance needs
"is this control stranded", third parties need control→what-may-I-set. Any single rooting forces the
other two to duplicate — which is how the four hand-authored ledgers drifted. Normalise once, project
many.

```json
{
  "schemaVersion": 1,
  "inputsDigest": "sha256:…",
  "scopeLaw": "DS-SCOPED. Reach numbers are NOT a deletion instrument.",
  "controls": [{
    "id": "shape.geometry", "tier": "free", "valueType": "graded-enum",
    "documentPath": "appearance.general.shape.geometry",
    "stops": [{ "id": "sharp", "t": 0 }, { "id": "soft", "t": 1 },
              { "id": "rounded", "t": 2 }, { "id": "pill", "t": 3 }],
    "probe": { "patch": [["appearance.general.shape.geometry", 0]] },
    "current": { "emits": [], "familiesReached": 0, "primitivesReached": 0, "stranded": true },
    "target":  { "minFamiliesReached": 8, "author": "…", "declaredOn": "…", "wo": "WO-…" },
    "delta":   { "verdict": "BELOW_TARGET" }
  }],
  "channels": [{ "name": "--ds-radius-md", "family": "radius", "scope": "role",
                 "propertyGroup": "radius", "owningFamily": "radius",
                 "reaches": ["card", "button", "input"], "readSites": [] }],
  "edges":    [{ "control": "shape.geometry", "channel": "--ds-radius-md",
                 "provenance": "differential-compile", "stopId": "sharp" }],
  "findings": [{ "class": "stranded-control", "subject": "shape.geometry" }]
}
```

`provenance` per edge is load-bearing: `differential-compile` (executed), `static-table` (a literal
map) and `interpolated-family` (pattern expansion) are three confidence levels that a flat list would
flatten into one lie.

**Two views, one source.** The full manifest, and a third-party subset carrying `documentPath`,
`valueType`, `stops`, `bounds`, `defaultValue` and human copy — with **no `--ds-*` names and no source
paths**. Publishing channel names to third parties makes them de-facto API and freezes our freedom to
move them. A tenant writes `appearance.general.shape.geometry`, never a channel.

### 5.2 How edges are derived: differential compile, not declaration

**`derivedChannels` is killed, not completed.** It covers 46 of 1,540 tenant channels — 3% — so its
absence proves nothing, and it is hand-authored, which is the failure mode with four existing
instances. Its errors are edge errors, not name errors: `--ds-color-primary-500` is a real foundation
token with 157 reads; what is false is the claim that a tenant control writes it. **The fix is to
delete the claim, not the name.**

Replacement: each control declares a **`probe`** — a concrete JSON patch, plus one per stop. Edges are
derived by `emit(∅)` versus `emit(patch)`, set difference. This also generates each stop's token set
for free.

An optional `expectedChannels` may remain, **inverted**: an assertion the gate verifies against the
executed emission. Declaration becomes test, never truth.

**Unverified and blocking**: this design assumes `compileTenantThemeConfig` accepts a partial document
and returns a flat variable map. **Probe this before committing the schema.**

### 5.3 The gate

Hard, never baselinable: input-digest staleness · `declared-not-emitted` · `undeclared-emission` ·
stop-count outside 3–5 for free-tier enums.

Ratchet, decrease-only, entries requiring `reason` + `wo`: `stranded-control` · `orphan-token`
(must be seeded — with 2,483 unadjudicated reads a hard fail on day one is unshippable, which is
exactly why the ratchet is what lets the gate land before the system is clean) · `duplicate-mechanism`.

Targets live in a **separate file**, so a lane cannot edit its own scoreboard in the same diff as its
work. Each requires `author`, `declaredOn`, `rationale`, and an open work-order id. Targets
**auto-ratchet**: when measured meets target for N consecutive runs, the target rises to measured — so
a target stops being an aspiration and becomes a floor.

### 5.4 Where it lives

Generator at `src/tooling/token-manifest/` — not `packages/core/scripts/**`, which is a declared
no-write domain, and a `src/tooling` module can import the compiler directly instead of loading a
possibly-stale `dist`.

Artifact published at the package root with a subpath export, matching the pattern already shipping
for `hooks-manifest`. Third parties consume the public JSON with no DS import.

### 5.5 Bootstrap — honest and small

v1: controls, channels, edges; emission by differential compile; classes and counts joined from the
existing census; families from the new read-site index. `current` for everything; `target` for one
field on the seven free controls only.

**Total new hand-authored input: ~11 probe bindings, ~250 family headers, 7 integers.** Everything
else is measured.

Deferred: painted-property counts, duplicate-mechanism overlap, option labels and the public view,
per-vertical reach, app-side reach.

---

## 6. The delta is the backlog

Wave content is derived, not invented. Each row below is generated by the manifest as a finding.

| Wave | Generated from | Known size today |
|---|---|---|
| Unblock | red gates | 2 gates red, 1 falsely green |
| Family authority | tokens with no declared family | ~250 headers |
| Naming ratchet | R1–R4 violations | 718 names (437 active) |
| Control consolidation | 20 controls → 11 | 9 merges, 2 retirements |
| Stranded controls | `primitivesReached ≤ 1` | 3 dead, 3 too thin |
| Duplicate vocabularies | I2 violations | 6 pairs, 48 hard forks to adjudicate |
| Plumbing reach | axis reach below target | border 12%, anatomy 4%, icon 4% |
| Literal debt | pure-literal declarations | 1,515, of which 315 in one file |
| Missing axes | axes with no token | weight, focus, control size, rhythm |
| Legacy purge | dead-by-gate + unreachable | DaisyUI confirmed; the rest per the census |

---

## 7. Open owner decisions **[O]**

Nothing downstream may assume an answer to these.

1. **Stored-document migration.** The consolidation deletes document paths: `shape.radius-scale` folds
   into `shape.geometry`. Every persisted tenant document addressing an old path is orphaned, and
   renumbering stops silently remaps stored floats. The entire migration story today is `version: 1`
   plus a prose compat string. **Does "nothing legacy survives" override tenants' persisted branding,
   or is there a versioning and remap contract?**
2. **Derived dark.** When a tenant authors only light seeds and the product renders dark, the dark ramp
   is derived from those seeds. Is derived dark-mode brand rendering acceptable, or must a tenant be
   able to review it?
3. **The 48 hard forks.** Each is two live names with different values. Merging changes rendering.
   Adjudicate per pair.
4. **Shadow and the elevation ramp.** 546 hand-rolled shadows bypass a ramp that does not express what
   components paint. Does the ramp change, or do the components?
5. **Breaking window.** The duplicate vocabularies are public API — `useTokens().transitions` is a
   published hook. Without a sanctioned breaking release, the purge reduces to aliasing, not deletion.
