# Token Manifest — specification

The normative reference for the token system. It records **what is** (measured) and **what must be**
(declared). The difference between the two is the wave backlog: the roadmap is derived from this
document, not written beside it.

Status: specification, revision 2 after adversarial review. Not yet generated.

---

## 0. How to read this document

### 0.1 Evidence classes

| Tag | Meaning |
|---|---|
| **[M]** | MEASURED — reproducible from a **committed** script over a stated corpus |
| **[U]** | UNVERIFIED — asserted from an ad-hoc script that was not committed. **Directionally load-bearing, numerically unusable.** Must be re-derived before any gate or target consumes it |
| **[D]** | DECLARED — a human wrote it; a gate checks it against measurement |
| **[O]** | OPEN — owner decision required; nothing downstream may assume an answer |

**Revision 2 introduced `[U]`.** Revision 1 tagged several figures `[M]` that no committed script
reproduces — the clustering block, the literal-debt trio, three layer counts. Under this document's
own Law 1 that is exactly the defect it exists to prevent, so those figures are now `[U]` and are
quarantined from every threshold.

### 0.2 The laws that govern the artifact

**Law 1 — the IS layer may contain only measured data. Declarations feed the MUST BE layer only.**

> If the IS layer copies declarations instead of measuring, the drift does not disappear — it gets a
> `generatedBy` header and stops being questioned. That is strictly worse than a hand-authored
> ledger, which at least everyone distrusts.

Two carve-outs, both required by review, both explicit rather than implied:

- **Declared ownership is an INPUT, not measured data.** `channel.family` is declared (§3) and rides
  in the IS table for join convenience. It is gated by I1–I4; it is never evidence.
- **Measurement parameterised by declaration is still declaration.** Edges are derived by executing
  probes, and **probes are declared**. A probe that patches only one stop manufactures a clean edge
  set. Therefore: probe totality — every stop of every control declares a probe — is a hard gate
  class, not a convention.

**Law 2 — ownership is declared and single; reach is measured and plural.**

`family` is a declared single owner; `reaches[]` is generated from the read graph. Uniqueness is
enforced on ownership only, so reach can grow without weakening any gate.

**The ownerless class is explicit.** 577 names exist only in the generated artifact layer and have no
declaration block to inherit from; a further large set is read but never declared in core. These
carry `family: null, ownerless: "generated" | "external"`. I1 does not apply to them; a separate
finding class tracks them. Without this, I1 is unenforceable on precisely the layers that mint names.

### 0.3 Scope of every measurement

`packages/core/src` only. **Reader counts are DS-internal**: the three apps are not in this
repository, so zero never proves a name unused. Interpolated reads (217 production sites) are
invisible to text scans, so **every read count is a floor**. Whole generated blocks — the material
family, the colour grid — are reached only this way.

---

## 1. The system as it is

### 1.1 Nine declaration layers

| # | Layer | Distinct names | Declared in |
|---|---|---:|---|
| 1 | Raw ramps | **453** [M] | `foundation/base/*` |
| 2 | Semantic role channels | 1,075 [M] | **one file**: `foundation/themes/default.css` |
| 3 | Component channels | 1,949 [U] | `presentation/components/*.css` |
| 4 | Family skin | 124 names / 30 declaring files [M] | `presentation/components/skin/` (146 files total) |
| 5 | Engine skin | 214 modern / 4 rustic [M] | `runtime/engines/*/skin/` |
| 6 | Generated vertical artifacts | 1,910 total, **605** exclusive [M] | `facade/artifacts/*` |
| 7 | Private `--_ds-*` | **99 declared** (310 mentions) [M] | co-located |
| 8 | Framework projection | 28 [M] | `framework-token-projection.css` |
| 9 | Runtime TS channels | ~356 [U] | `tokens/ts/`, `ui/**` |

Total distinct declared across `src/**/*.css`: **4,164** [M].

Two facts that shape the governance design:

- **The engine skin layer AUTHORS.** 182 of 214 modern-skin names are declared in no other layer. A
  family lane mints channels, today without a guard.
- **Layers 3–5 are unreachable through `tokenOverrides`** but ARE reachable through `chrome`, which
  kebab-cases chrome objects into `--ds-*` names.

### 1.2 The tenant surface [M]

| | |
|---|---:|
| Writable leaves, `mode: "simple"` | 36 |
| Writable leaves, `mode: "advanced"` | 1,804 |
| Hard cap: compiled variables | **512** |
| Hard cap: `tokenOverrides` entries | **200**, drawn from a closed **294**-name allowlist |
| The Management writes today | **66 leaves** (35 of them `tokenOverrides`) |

**The allowlist is 294, not 71.** `TENANT_THEME_OVERRIDE_TOKENS` is 71 literal entries plus two
spreads — `TENANT_SEMANTIC_SURFACE_TOKENS` (160) and `TENANT_SEMANTIC_TYPOGRAPHY_TOKENS` (63).
Revision 1 counted the literal lines. *Verified independently twice.*

**Seven of the 294 are range-checked**, not two: `--ds-density-scale`, `--ds-effect-intensity` and
five `--ds-line-height-*`. The load-bearing point survives: **`--ds-radius-{sm,md,lg,xl}` are
unclamped, so a Pro tenant can set `--ds-radius-md: 0px` today.** The envelope binds the Standard
dials, not the Pro path.

### 1.3 Where the range actually is [M]

| Axis | Enough range to read as a different company? | Limited by |
|---|---|---|
| Font family | **yes — the largest lever available today** | nothing; already open |
| Border / edge weight | yes | **plumbing** |
| Elevation / depth | yes | **plumbing** — hand-rolled shadows bypass the ramp |
| Geometry | yes on Pro, **no** on Standard | both, differently |
| Iconography | yes | **plumbing** — raw `strokeWidth` bypasses |
| Anatomy | yes — 12 declared variants | **plumbing** |
| Density | no | **contract** — CSS permits 0.5–3.0, the envelope 0.85–1.15 |
| Type scale | no | **contract** — ±8% |

> **Only density and type scale need the contract widened. Everywhere else the contract already
> permits more than the CSS delivers.**

### 1.4 Tokenisation is not the problem [U]

The corpus is high-90s percent tokenised; pure literals are a minority concentrated in a small number
of files, with `presentation/components/skin/oauth-transition.css` (2,248 lines [M]) the single
largest holder.

**Revision 1's trio — 16,715 governed / 1,515 literal / 9.1% — does not reproduce.** Independent
re-derivation put the literal share between 12.9% and 24% depending on corpus, and the oauth file's
literal count between 420 and 962. The *direction* is confirmed and load-bearing: the gap is that
tenant controls do not reach tokens, not that the CSS is untokenised. **The numbers are quarantined
until a committed script produces them.**

### 1.5 Known-dead and known-broken [M]

- **`shape.button-style` is dead on the Standard path.** It writes `--ds-radius-button`, zero
  production readers. The Pro path writes both that and `--ds-button-{size}-radius`, which is read.
  **A Pro customer can make pill buttons; a Standard customer cannot.**
- **`shape.radius-scale` is inert on all three verticals.** `styles/bithire.css` declares *both*
  `--ds-radius-lg: 14px` and the `calc(base × scale)` form. **The raw literal is a cascade override,
  not a missing token.** The repair emits per-vertical `--ds-radius-*-base = flat ÷ scale`; deleting
  the flat values is NOT value-preserving (evnto's scale is 1, so its radii would drop from
  10/14/18/24 to 6/8/12/16).
- **Three expressive values expand to nothing**: `motif: dots | deco-fan | ambient-orbs`. The `icon`
  axis has no expansion branch at all — it is consumed in JS.
- **DaisyUI is dead**: 0 class consumers by AST over 137 modern files, 0 bare-class renders across
  all three apps, no app dependency, no `@plugin`/`@import` in the CSS pipeline. Deletion scope is
  five items; `personality.css` needs a per-rule pass, not a block delete.

### 1.6 Axes with no token at all [M]

| Missing axis | Would reach | Why it matters |
|---|---:|---|
| **Font weight** | 154 families | The strongest greyscale identity signal; no axis, no override token, no dial |
| **Focus / selection** | 95 families | 385 read sites, no control of any kind |
| **Control size** | 88 families | Welded to density today — a "spacious" tenant gets airy layout with identical button heights |
| **Rhythm** | 78 sites → ~199 | Token and two-tier split exist; not in the allowlist, no envelope range |

---

## 2. The control set — what must be [D]

Eleven controls replacing twenty. **This is consolidation AND dimensionality reduction.** Revision 1
presented it as pure deduplication, which was false: every merge collapses a product space into a
one-dimensional path. Each row below states what is lost.

| Control | Tier | Named stops | Absorbs | **Lost in the merge** |
|---|---|---|---|---|
| `brand.color-seeds` | free | — | unchanged | — |
| `shape.geometry` | free | sharp · soft · rounded · pill-accented | `shape.button-style`, `shape.radius-scale`, geometry axis | silhouette × radius independence; the range [0.75, 0.85) |
| `layout.density` | free | compact · standard · spacious | `density.mode`, density field — **NOT rhythm** | continuous densityScale between stops |
| `spacing.rhythm` | free | tight · normal · airy | — (**kept separate**) | — |
| `surface.edge` | free | borderless · hairline · outlined · ruled | edge axis | `inset-double` moves to premium |
| `surface.depth` | free | flat · paper · soft-depth · dramatic | `material`, `elevation`, `effect-intensity`, `elevation-posture` | `frosted`, `luminous`, `hairline-lift`, `luminous-glow`; continuous effect-intensity |
| `type.voice` | free | sober · editorial · humanist · geometric · **technical** | `typography.pairing` | — (technical restored, see below) |
| `motion.energy` | free | calm · standard · lively | `motion.dial` | intensity × duration × ambient independence |
| `type.foundations` | premium | graded ±8% + stack choice | `typography.families`, `typography.scale` | — |
| `iconography.style` | **pro** | linear · strong-outline · duotone · solid-active | `profiles.icon` | — (tier held, see below) |
| `chrome.suite` | premium | per-surface bundles | `sidebar-tone`, `chrome.families`, `chrome.anatomy` | 36 independent anatomy combinations |
| `surface.motif` | premium | none · micro-grid · pinstripe · contour | background patterns | three stops currently expand to nothing |

### 2.1 Four corrections to revision 1

**Rhythm is NOT welded to density.** Revision 1 merged them. The registry states rhythm is
*"ORTHOGONAL to density.mode by construction and never a second spelling of it: density scales
control SIZES, rhythm scales the LAYOUT RELATIONSHIPS between controls"*, and the compiler repeats
*"the two must never be collapsed"*. **Verified at `capabilities/index.ts:270`.** Revision 1 also
condemned welding control-size to density in §1.6 and then welded rhythm the same way. `spacing.rhythm`
stays a separate free control.

**`technical` is restored to `type.voice`.** It is the only writer of `--ds-font-family-mono` on the
simple path; dropping it would kill the monospace dial for every Standard tenant.

**`iconography.style` stays Pro.** Moving it to premium is an access regression for existing Pro
tenants. A tier move is a commercial decision, not a taxonomy decision, and does not belong in this
table — it is now open decision #7.

**The geometry stop table is non-monotonic and its top stop is out of envelope.** Measured:
`sharp 0.85 → soft 1.15 → rounded 1.25 → pill-accented 1.1`. Two consequences: lerping toward the
final stop **decreases** radius, and `rounded`'s 1.25 exceeds both vertical envelopes' 1.20 maximum.
The stop table must be re-ordered or re-valued before the graded scale is implemented. Note the
published value id is `pill-accented`, not `pill`.

### 2.2 Why the envelope does not need widening

> **The differentiation budget lives in the categorical channels, which the envelope does not touch.**
> Two companies at the same radius scale with different silhouette, edge and pairing read as different
> companies in greyscale. Two at opposite ends of the clamp with identical keywords do not.

`buttonStyle: sharp | soft | pill` switches **which radius channel a button reads**. That categorical
jump is what expresses the square corner the numeric dial cannot reach.

### 2.3 Graded scales [D]

Each dial is a scalar `t ∈ [0, k−1]` over `k` stops at integer positions.

| Channel type | Rule |
|---|---|
| Numeric | **lerp** between adjacent stops |
| Keyword / enum / font stack | **nearest-stop ownership**, flipping at the midpoint |
| Untyped, or missing at one stop | **compile error** — never a silent hold |

The third rule is required: expansion variables are emitted as `Record<string, string>`, so the
compiler cannot distinguish `"0.5px"` from a keyword. **Interpolation requires a channel-type
registry.** Without totality, partial tables such as `motif` would interpolate into silently
disappearing channels.

**Repair first:** `assertExpressiveEdgeWidthInvariant` is fail-closed against a hand-written table and
will reject interpolated widths until re-derived. Golden tests pinning exact expansion values move to
per-stop plus midpoint assertions.

### 2.4 The cross-vertical trap [M]

`effectIntensity` maxes at 0.65 for bithire and 0.75 for evnto, and out-of-range is **rejection, not
clamping**. An interpolated 0.70 **compiles for evnto and throws for bithire**.

Scales are therefore defined against the **intersection** of vertical envelopes. This also binds the
probe harness itself (§5.2).

---

## 3. The taxonomy

Three axes. Two derived, exactly one declared.

| Axis | Source |
|---|---|
| **Property group** (17) | derived from read sites |
| **Scope** (7) | derived from declaration site |
| **Family** (~250–300) | **declared — the only human field** |

### 3.1 Why the name cannot be the family

The name-derived family disagrees sharply with the read-derived grouping [U]: roughly a quarter of
name-families are internally fragmented, a third of tokens are read only by units unrelated to their
name stem, and the correlation between name-family and property group is weak. **These figures are
quarantined pending a committed script**, but the direction is independently confirmed by a fact that
is fully reproducible:

**`hooks-manifest.json.declaredSlots` is the only place a human has ever declared a family — 93 hooks.
It equals the name-derived family 0 times out of 93. Seven of its fifteen families merge between two
and eight name-families; zero name-families split across declared families.** [M]

> Where a human declared, the name was **always too fine and never too coarse**. The migration is
> merge-only — the mechanically safe direction.

### 3.2 Family is declared per block — after a prerequisite

Family is declared once per declaration block and every token inside inherits:

```css
/* @ds-family select
   @ds-anatomy primitive/inputs/select
   @ds-scope component-channel */
```

**Revision 1 claimed no token is declared in more than one unit within a layer. That is false.** [M]

| Duplication | Names |
|---|---:|
| `base/density.css:64-141` ≡ `base/spacing.css:34-126`, byte-identical | **63** (verified) |
| family-skin files | 11 |
| engine-skin files | 3 |
| twice inside `default.css` (light `:root` vs dark block) | 49 |

**Prerequisite, blocking:** deduplicate the byte-identical density/spacing block and define light/dark
precedence **before** a single header is written. Otherwise ~77 tokens receive two family headers on
day one and the unresolvable-pair rule reds the gate at birth.

Multi-layer declarations resolve by scope precedence; an unresolvable pair within a layer is a gate
failure.

### 3.3 Invariants — four kept, three rejected [D]

| # | Invariant | Verdict |
|---|---|---|
| **I1** | One declared owner per token, from the declaration block, never the name | **keep** — does not apply to the ownerless class (§0.2) |
| **I2** | **No two families own the same (property-group, slot) pair at the same scope** | **keep — the anti-duplication mechanism** |
| **I3** | Every token in a family has ≥1 reader inside that family's anatomy | **keep** |
| **I4** | A token's reads are ≥90% one property group | **keep**, after relay resolution |
| — | *One canonical authority per family per property group* | **reject** — median 2 tokens per cell, max 69. **Applying this at the wrong grain is why the generated catalog labels two rival border families `canonical-authority`** |
| — | *Every family reachable by a tenant control* | **reject at family level** — re-scoped to: every **role-scope** token must be tenant-reachable |
| — | *A family spans ≥N components* | **reject** — per-component families are the norm |

I2 was tested against the six duplicate vocabularies shipping today: **all five testable pairs would
have been blocked at birth.**

**Before I4 is switched on**: 472 tokens are pure relays, read only into another custom property.
They classify as `custom-prop-chain` and would fail for the wrong reason. Resolve their property group
transitively through the derivation graph first.

---

## 4. The naming law [D]

```
--ds-<family>-<element>*-<variant>*-<property>-<layer>?-<state>?
```

`family` and `property` required; `variant` precedes `property`; `family` is a **registry with
longest-match**, not "the first segment".

Closed vocabularies:

| Vocabulary | Members |
|---|---|
| STATE | hover, active, focus, disabled, selected, checked, visited, expanded, loading, dragging, rest |
| SCALE | 2xs…9xl, xxs, full, none |
| LAYER | base |
| AXIS | inline, block, start, end |
| ROLE | primary, secondary, **tertiary**, accent, neutral, success, warning, error, info |
| RANK | canvas, sunken, raised, overlay, inset |
| STEP | 50…950 |
| VARIANT | default |

*(`tertiary`, `xxs`, the numeric steps and `default` were missing from revision 1's vocabularies while
§4.1 relied on them — five live names were unparseable and any new one would have failed R3.)*

### 4.1 The ambiguity killer — and its limit

The intent: disjoint closed vocabularies plus fixed slot order make `canonical(name)` a function of
the segment multiset, so two orderings normalise to one name and the collision becomes
unrepresentable.

**Review established that this does not hold as written.** Three independent breaks [M]:

1. **At least 13 vocabulary words are already overloaded** — `base` is both LAYER and a ramp step
   (`--ds-font-size-base-base` carries both), `overlay` is both RANK and a five-name family,
   `focus`/`active`/`expanded`/`error`/`loading` appear as families and mid-name elements. **224
   declared names carry a non-terminal state word the grammar cannot generate**, because `<state>` is
   terminal-only.
2. **Canonical depends on the mutable family registry.** Registering a family retroactively changes
   existing names' canonical forms.
3. **The canonical form is frequently already occupied by a live, different-valued name.**
   `canonical(--ds-card-padding-md)` = `--ds-card-md-padding`, which exists at 1rem versus 1.25rem.

> So collisions are not made unrepresentable. **They become mandated merges of live channels** — the
> hard-fork problem by another route. 51 exact multiset-collision groups exist among the 4,164
> declared names.

**Consequence for the design:** `canonical()` is demoted from a *law that prevents collisions* to a
*detector that reports them*. R4 becomes a reporting rule whose findings enter the hard-fork
adjudication queue, not a gate that rejects. The grammar must also admit a `property`-less form, or
it cannot express the survivor of the z-index fork (`--ds-z-index-tooltip`).

**The RANK/ROLE fix stands.** `--ds-color-bg-primary` and `--ds-color-bg-canvas` are byte-identical in
`styles/rottay.css` dark, so `primary` there is a rank word wearing a role name. Reserve
primary/secondary/tertiary to ROLE; rank uses canvas/sunken/raised/overlay/inset.

### 4.2 Four "synonyms" that are not [M]

| Pair | Why they differ |
|---|---|
| `space` / `spacing` | `--ds-space-*` is the **Space component**, not a scale |
| `shadow` / `elevation` | Elevation is a **level ramp**; shadow renders a level. Only 4 names are misuses |
| `border` / `stroke` | All 9 `stroke` names are SVG, where `stroke` **is** the property |
| `disabled` / `inactive` | `inactive` means *unselected* |

Real: **`-padding-x` vs `-padding-inline`** — winner `inline`/`block`, because `x`/`y` are wrong under
`dir=rtl`. `bg` beats `background` because `background` is also the CSS shorthand property.

### 4.3 The permutations are not renames — and their classes are vertical-dependent [M]

Comparing both members of each permutation group **inside one bundle** yields four classes, of which
roughly a third are hard forks — both names declared with different values. Exact group totals differ
by corpus (95–100 groups) and are `[U]`; the qualitative finding is stable at 32–41 hard forks.

**The fourth unsafe "mechanical" fix, and the most dangerous:** the classes are **per-vertical**.
`--ds-button-primary-bg-hover` versus `--ds-button-primary-hover-bg` is an **alias in bithire** and a
**hard fork in evnto** (`#262626` vs `#F0F0E8`). A group filed "safe merge" from one bundle is a
rendering change in another.

> **Nothing in this repository is mechanical until it is verified across all three verticals.** This
> is the fourth instance of a "mechanical" repair that changes pixels — after the radius emission,
> the pass-through deletion and the permutation renames.

**Alias retirement is also not cascade-preserving.** Repointing readers from `--ds-a` to `--ds-b`
skips a layer a vertical may override: if a vertical overrides only `--ds-a`, the override stops
reaching the repointed readers.

### 4.4 The ratchet [M/U]

R1 (state word terminal) and R2 (variant precedes property) carry a combined day-one debt in the
mid-hundreds; the exact split is `[U]` (revision 1's 497/221 does not reproduce; re-derivation gives
393 or 625 for R1 depending on corpus). R3 (lexicon) baselines the unknown-word set. R4 becomes a
**report**, not a gate (§4.1).

Nothing existing must move. A new violating token fails immediately.

### 4.5 What is never a textual substitution [M]

Interpolated names (217 production sites — fix the TS template, never the CSS) · six
hand-adjudicated ledgers · name-keyed gate baselines, where **a rename reads as one removed plus one
added and a decrease-only ratchet nets it to zero, hiding it** · the shipped public surface, where
229 declared names have zero DS reads and any app-side reader is invisible to us.

---

## 5. The artifact [D]

### 5.1 Shape: edge-rooted, three tables, two views

Three tables — `controls`, `channels`, `edges` — plus `findings`. Any single rooting forces two of the
three consumers to duplicate, which is how four hand-authored ledgers drifted.

`provenance` per edge distinguishes `differential-compile` (executed), `static-table` and
`interpolated-family` — three confidence levels a flat list would flatten into one lie.

**Two views, one source.** The full manifest, and a third-party subset carrying `documentPath`,
`valueType`, `stops`, `bounds`, `defaultValue` and human copy — with **no `--ds-*` names and no source
paths**. Publishing channel names to third parties makes them de-facto API. A tenant writes
`appearance.general.shape.geometry`, never a channel.

**The manifest is not a fifth ledger — but only if the law is written down**: the registry is the
declared INPUT; the manifest is the sole PUBLICATION. `channels`, `edges` and `findings` derive;
`controls` duplicates the registry unless that division is explicit.

### 5.2 Edge derivation: differential compile — verified viable, with three amendments [M]

**`derivedChannels` is killed, not completed.** It covers 46 of 1,540 tenant channels, so its absence
proves nothing, and it is hand-authored. Its errors are edge errors, not name errors:
`--ds-color-primary-500` is a real foundation token with 157 reads; what is false is the claim that a
tenant control writes it. **Delete the claim, not the name.**

Replacement: each control and stop declares a **`probe`** — a concrete document — and edges are the
set difference between baseline and probe emission.

**The blocking unknown is resolved.** Partial documents are *rejected*, but the minimum viable
document (`schemaVersion`, `mode`, identity fields, empty `appearance`) compiles and emits **exactly
zero variables**. Compilation is pure and deterministic; `variables` is a flat sorted record.

Three amendments, all mandatory:

1. **The baseline is `emit(minimal)`, not `emit(∅)`.**
2. **Edges are keyed by (control, stop, VERTICAL).** Only bithire and evnto have envelopes, and
   out-of-range probes **throw** — the §2.4 trap binds the harness itself. Per-vertical edges are
   required from day one, not deferred.
3. **Probes are independent documents, never cumulative.** APCA autocorrect rewrites previously
   authored foregrounds, which would attribute a change to the wrong control. Compare emission on
   **names**, not values, for the same reason.

Empty emission for `motif: dots | deco-fan | ambient-orbs | none` and for the whole `icon` axis is
**by design** — pin it as expected-empty rather than flagging those controls stranded.

### 5.3 The gate

Hard, never baselinable: input-digest staleness · `declared-not-emitted` · `undeclared-emission`
(compared on names) · **probe totality** (§0.2) · stop-count outside 3–5 for free-tier enums.

Ratchet, decrease-only, each entry requiring `reason` + `wo`: `stranded-control` · `orphan-token`
(seeded — a hard fail on day one is unshippable, which is exactly why the ratchet is what lets the
gate land before the system is clean) · `duplicate-mechanism`.

**Digest staleness is heavy:** the generator imports the compiler from source, so any token or
compiler change reds the gate until the manifest is regenerated. That is the intended behaviour for a
generated artifact and matches the existing catalog gates, but it must be a documented cost.

Targets live in a **separate file** so a lane cannot edit its own scoreboard in the same diff as its
work. Each requires `author`, `declaredOn`, `rationale` and an open work-order id. Targets
**auto-ratchet** when measured meets target for N consecutive runs.

### 5.4 Where it lives

Generator at `src/tooling/token-manifest/` — a `src/tooling` module imports the compiler directly
instead of loading a possibly-stale `dist`. *(Revision 1 justified this by citing a repo-wide
`scripts/**` no-write law. That rule is a per-round programme constraint, not standing repo law; the
dist-staleness argument is the real reason.)*

Artifact published at the package root with a subpath export, matching `hooks-manifest`.

### 5.5 Bootstrap

v1: controls, channels, edges; emission by differential compile per vertical; classes and counts
joined from the existing census; families from the new read-site index. `current` for everything;
`target` for one field on the free controls only.

New hand-authored input: probes per (control, stop), ~250 family headers, a handful of integers.

---

## 6. The delta is the backlog

| Order | Wave | Generated from |
|---|---|---|
| 0 | Unblock | red gates — 2 red, 1 falsely green |
| 1 | **Base-layer dedupe** | the byte-identical density/spacing block — **blocks the family authority** |
| 2 | **Resolution instrument** | the computed-style harness. **Revision 1 dropped this wave entirely**; nothing in plumbing can be honestly validated without it |
| 3 | Family authority | tokens with no declared family (~250 headers) |
| 4 | Naming ratchet | R1–R3 violations; R4 reports into the fork queue |
| 5 | Stranded controls | `primitivesReached ≤ 1` |
| 6 | Duplicate vocabularies | I2 violations; hard forks adjudicated per pair, **per vertical** |
| 7 | Plumbing reach | axis reach below target — requires wave 2 |
| 8 | Literal debt | pure-literal declarations — requires wave 2 |
| 9 | Missing axes | weight, focus, control size, rhythm |
| 10 | Control consolidation | 20 → 11 — **gated on open decision #1** |
| 11 | Legacy purge | dead-by-gate plus unreachable |

---

## 7. Open owner decisions [O]

1. **Stored-document migration.** Consolidation deletes document paths; every persisted tenant
   document addressing an old path is orphaned, and renumbering stops silently remaps stored floats.
   **Does "nothing legacy survives" override tenants' persisted branding, or is there a versioning and
   remap contract?** Wave 10 is blocked on this.
2. **Derived dark.** A tenant authoring only light seeds gets a derived dark ramp. Acceptable, or must
   a tenant be able to review it?
3. **The hard forks.** Each is two live names with different values, **and the classification is
   per-vertical**. Adjudicate per pair, per vertical.
4. **Shadow and the elevation ramp.** Hand-rolled shadows bypass a ramp that does not express what
   components paint. Does the ramp change, or do the components?
5. **Breaking window.** The duplicate vocabularies are public API — `useTokens().transitions` is a
   published hook. Without a sanctioned breaking release the purge reduces to aliasing.
6. **Vertical identity authority.** `platform` ships an artifact but has no envelope; the
   slug/verticalKey pair lives in at least five places; `styles/rottay.css` and `styles/platform.css`
   are byte-identical (shipped twice). Since every edge is keyed per vertical from day one, **which
   verticals exist and under which key is blocking, not deferrable**.
7. **Tier moves.** `iconography.style` pro→premium is an access regression for existing Pro tenants.
   Tier placement is a commercial decision and is held at its current tier until decided.
