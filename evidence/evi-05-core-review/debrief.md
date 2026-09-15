# CORE-REVIEW DEBRIEF — WO-EVI-05: exclusión semántica acotada del par radio/shape

Reviewers required by the shared-core rule (roadmap/README.md §execution-policy):
Codex, Fable, Kimi — the SAME debrief. Verdicts: ACCEPT or CHANGES, with reasons.
No verdict is inferred; each is recorded verbatim in the WO-EVI-05 progressLog.

- WO: WO-EVI-05 (in-progress). Lane: evidence/axes.
- Base: `main` @ `3dd32ac681bd66f19966533a5a37f32bfc38ded0` (re-pinned at implementation).
- Proposer: kimi-admin (DT). Implementer after review: claude-admin (Opus).
- Owner direction (2026-09-14, verbatim intent): keep the bare radio's circle and dot;
  admit a scoped semantic exclusion for that invariant anatomy; no fabricated frame, no
  squaring to satisfy a counter; exclusion via the standing core review; never all
  `--ds-radius-full` reads, never all Radio variants; Radio.Group stays in population
  with its real owner; publish 29/29 applicable + 1 justified N/A, never 30/30 moving;
  keep absolute minima, six fleet axes and both negative controls; the exception must
  carry a mutant proving it hides no configurable corner; EVI-05 closes only with zero
  applicable failures, published population and the resolved contract review; D-30
  stays deferred.

## Facts (measured, Codex post-107 audit + source pins)

- The bare radio skin paints exactly two radii, both `--ds-radius-full`, on the
  indicator (`runtime/engines/modern/skin/radio/index.css:64`) and the dot (:203).
  The circle is the semantic identity of single-choice; the dot is bound to it.
- The bare root stamps no radius-bearing frame; the focus outline follows the
  indicator (outlines carry no radius); the touch target is a height — kit rule 4
  does not count height as shape.
- `familyAxisDeclarations` (scripts/check/theme/population/index.mjs:256) derives
  shape membership from ANY authored `border-radius` in the family skin files. It
  cannot distinguish invariant identity anatomy from a tenant-owned corner — that is
  why the bare radio enters the shape denominator and can never move: 29/30 pairs
  measured moving, radio/shape the sole remaining failure, both modes, both
  orientations, both negative controls at zero, planted severed family detected.
- `radio-group` is a SEPARATE family in the population with its own presentation skin
  (`presentation/components/skin/radio-group/index.css:92`,
  `border-radius: var(--ds-radius-md)`), imported by the facade
  (`facade/entrypoints/base/index.css:201`). It stays shape-applicable; whether its
  corner actually responds to the shape decision is a separate wiring verification
  obligation, registered in WO-EVI-05 (not waived by this amendment).

## Proposed contract amendment (the change under review)

1. **Semantic-identity exclusion, parts-bound, closed registry.** The population owner
   gains a closed exclusion registry (data, one entry):
   `{ family: 'radio', axis: 'shape', skin: 'runtime/engines/modern/skin/radio/index.css',
      selectors: [<exact indicator selector at :64>, <exact dot selector at :203>],
      reason: <semantic identity>, review: 'WO-EVI-05 core review 2026-09-14' }`.
   Derivation change: for the shape axis, `border-radius` declarations whose selector
   matches a registered exclusion's selectors do not count as a shape declaration —
   for that family only, for those exact selectors only. If every authored radius in
   the family's skin is excluded and no other shape signal exists, the family leaves
   the shape population and the pair is published as **N/A with reason**, not as moved.
2. **Single population owner for pilot and fleet** (no parallel mechanism): the same
   registry feeds `familyAxisDeclarations`, `axisPopulations`, `populationReport`
   (which gains a `notApplicable` list per axis carrying the reason), the pilot pin
   (`pilot/index.json` republished: shape 5→4 applicable families + 1 N/A record) and
   the fleet baseline. Exact old/new membership is recorded in the publication.
3. **Pilot assertion flip** (`tests/integration/axis-difference-pilot/index.test.tsx`):
   `NOT_YET_GREEN` is deleted. The test now requires **zero applicable failures** in
   every mode/orientation AND exactly the registered N/A set published by the
   population owner (29/29 applicable + 1 N/A). Absolute minima, six fleet axes and
   both negative controls (0% on every applicable cell; planted severed family
   detected) are unchanged.
4. **Drift guards on the registry** (population tests): each exclusion's selectors
   must exist verbatim in the named skin file (rename the part → exclusion stale →
   failure forces re-review); an exclusion whose family still declares radius on a
   non-excluded selector has no effect (family stays in population).

## Mutants proving the exception hides no configurable corner

- (a) Planted tenant-owned corner: a fixture root whose radio skin adds
  `border-radius` on a non-excluded part (e.g. the root frame) → the family re-enters
  the shape population and the pilot evaluation FAILS the pair (exemption invalidated,
  membership restored).
- (b) Severed applicable family (existing mutant): unchanged, still detected.
- (c) `radio-group` continuity: severing the radius chain in the radio-group skin
  fixture keeps it shape-applicable and the drill names it — the exclusion never
  reaches other families.

## Owners and write set (implementation, after review)

- `packages/core/scripts/check/theme/population/index.mjs` (+ its `tests/`, +
  `pilot/index.json` republication, + the new closed registry data file under the same
  owner), `packages/core/tests/integration/axis-difference-pilot/index.test.tsx`.
- NO product-component change: the radio skin is untouched; the circle stays.
- Opus implements; Kimi audits the diff and reruns pilot/population/drills.

## Invariants preserved

Absolute population minima; six fleet axes; both negative controls at zero;
planted-mutant detection; single compiler path; single population owner;
append-only registry history; D-30 deferred (no branding decision needed);
Radio.Group population continuity with its wiring obligation registered, not waived.

## Alternatives considered (all rejected except the proposal)

1. Square the indicator / add a cosmetic frame — product-dishonest; fabricates a
   customization nobody chose; breaks the semantic identity of single-choice.
2. Count height as shape — kit rule 4: height is not shape.
3. Keep the pair applicable forever and document the red — the pair is genuinely
   non-applicable; a permanent known-failure list is exactly what EVI-05 may not
   close with.
4. Exclude every `--ds-radius-full` read / all Radio variants — over-broad; hides
   genuinely configurable corners; explicitly forbidden by the owner.
5. **Chosen**: parts-bound semantic-identity exclusion with mutant proof (above).

## Executable acceptance (what "resolved" means)

Population suite 15/15 with the new registry drills; pilot instrument green with
ZERO applicable failures + exactly one registered N/A per mode/orientation; mutants
(a)(b)(c) red as specified; liveness/population/family-cut gates green; WO-EVI-05
publishes 29/29 applicable + 1 N/A with the population republication; A2-pilot
claimable afterwards.

## Questions to reviewers

(i) Is the declaration-semantics amendment scoped tightly enough (parts-bound, closed
registry, single population owner)? (ii) Is the N/A publication contract honest
(29/29 + 1 N/A, never 30/30)? (iii) Are the three mutants sufficient proof that the
exception hides no configurable corner? (iv) Does the Radio.Group continuity
obligation (registered wiring verification) close the population hole without
inventing a duplicate skin? (v) Any drift path left unguarded?
