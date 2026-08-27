# Modern Rescue — START HERE

This is the only human entry point for WO-CRA-23. A new agent starts here,
follows the linked machine contracts, checks the repository, and continues the
active packet. No other Markdown file may redefine this programme, its status,
its denominator, its control model, or its acceptance law.

## Product promise

A small set of understandable public customization controls must produce a
large, coherent and observable change across the design system. A control is
not complete because a token exists, a file changed, a selector mentions it, or
a screenshot was taken. It is complete only when the same semantic input:

1. is accepted by the static `BrandTheme` and DB `TenantTheme` paths;
2. is normalized by one authority into governed semantic channels;
3. reaches every declared canonical family, stable part and property group;
4. moves the intended computed properties and leaves negative controls fixed;
5. restores the exact baseline when removed; and
6. survives applicable responsive, RTL, accessibility, input and motion stress.

There may be many internal tokens. There must not be many product dials for the
same concept. A replacement retires its predecessor in the same completed
migration; aliases are not a second product model.

## Authority tree

The tree is deliberately small:

| File | Authority |
|---|---|
| `README.md` | human entry, laws, resume algorithm and execution order |
| `program.json` | programme identity, fences and source authorities |
| `checkpoint.intent.json` | machine-rendered current packet intent |
| `manifest/index.json` | generated index of the segmented control, recipe and per-family customization manifest |
| `rounds.json` | R0–R6 execution boundaries; R7 is future and disabled |
| `family-inventory.json` | canonical family identity and ownership; the active denominator |
| `customization-model.json` | operational controls, proposed target model and control-to-family evidence contract |
| `quality-rubric.json` | DONE, test-truth and acceptance vocabulary |
| `evidence-contract.json` | source binding, computed, restore and sighted receipts |
| `tenant-art-direction.json` | same-tree tenant outcomes, not another compiler |
| `visual-craft-contract.json` | sighted criteria and checkpoint bounds |
| `agent-orchestration.json` | disjoint ownership and advisory roles |

`roadmap/registry.json` is the machine status index and points here.
`roadmap/craft.md` contains only the short WO pointer. Historical sealed
evidence remains under
`packages/core/test-artifacts/quality-evidence/wo-cra-23/`; evidence is not a
roadmap and never overrides this tree.

The segmented manifest is the assessment and acceptance authority.
`family-ledger.json` is sealed historical evidence and is **not** an input to
anything active. It records git-derived source-visitation facts from the
252-family era; its `SOURCE_TOUCHED`, `TESTS_ONLY` and old review fields were
never progress and are never read as current state. Nothing active hashes it,
counts it, or requires its ids to agree with the catalog — an archive that has
to be rewritten whenever a family is renamed is not an archive. The active
denominator comes from `family-inventory.json`, and a generated manifest rollup
is the only place that may aggregate current family/control state.

Architecture documentation remains authoritative for architecture. If an
execution finding changes architecture, update its owning contract rather than
writing another programme.

## Binding constitution

The following are machine-checked by `program-check.mjs` and are not subject to
prose reinterpretation:

- **Control tiers.** Operational product truth is exactly 13 Standard controls
  and 7 Pro capabilities recorded in `customization-model.json` and
  `program.json`. The proposed 9 Standard + 7 Pro taxonomy is a design target
  with `implementationState: PROPOSED_NOT_IMPLEMENTED`; it never counts as
  coverage and may not coexist with an equivalent operational control. Expert
  is a closed 294-entry exact allowlist with at most 200 overrides per document;
  it is frozen during the drain unless the owner separately authorizes a bounded
  addition.
- **Namespace lifecycle.** `--ds-*` is the public canon. `--_ds-*` is a governed
  private/provisional namespace used only below the tenant pipeline for
  component-private or family-prototype sockets; it requires an owner, producer,
  fallback authority, productive consumer and an explicit promotion/derivation/
  retirement disposition. `data-*` is the governed DOM-attribute axis. Product or
  vertical dialects (`event`, `ticket`, `dashboard`, `rottay`, `bithire`,
  `evnto`, `--rt-*`, slug-derived names) are forbidden in both token namespaces,
  contracts and Theme keypaths.
- **Transport equality.** Static `BrandTheme` and DB `TenantThemeDocument` are
  transports only. Both resolve to the same complete nested Theme, enter exactly
  one `compileTheme`, and produce identical keypaths, channel inventory,
  deterministic order, CSS and digest for equivalent values. `ThemePatch` exists
  only at ingestion and never reaches the compiler.
- **Topology.** One status authority, one static/DB normalization model, one
  semantic icon supplier, no tenant selectors or tenant-conditional component
  trees, no family writer mints public `--ds-*` channels, no second compiler, no
  application-private DS patch, no hand-edited generated artifact or baseline.

## Fixed scope and honest progress

The closure universe is every canonical ID in `family-inventory.json`.
Static reach, CSS basename spread, files touched, tests present, capture counts
and source commits are prioritization signals only. They cannot shrink the
denominator or award progress.

In particular:

- `SOURCE_TOUCHED` means only that a source path changed.
- A null `reviewVerdict` is not acceptance.
- The former 103-family rescope is retracted: it mixed CSS basenames with
  canonical families and used a selector-unaware, first-`var()` reach model.
- Reach reports may order work, but no reach report decides DONE.
- Historical acceptance claims remain historical until reconciled against this
  contract; they are not silently discarded or promoted.

Every family in the active inventory eventually receives an explicit disposition for
every governed control: `APPLICABLE`, `INVARIANT_WITH_REASON`,
`NOT_APPLICABLE_WITH_REASON`, or `UNKNOWN`. Absence is never interpreted as not
applicable.

## Operational controls versus the target model

The capability registry is the only operational product-control authority.
`customization-model.json` records the current 13 Standard controls and seven
Pro capabilities from that source. The proposed 9 Standard + 7 Pro model is a
design target, not implemented product truth.

Only one model is operational at a time. A target control becomes operational
through an atomic migration that proves a unique owner, static/DB lowering,
consumer propagation, exact restore and predecessor retirement. A proposed
name never counts toward coverage and must not be added beside an equivalent
operational control.

For each operational control the trace must end in exactly one disposition per
family in the active inventory.
An `APPLICABLE` row names canonical family ID, stable part, property group,
computed CSS properties, source bindings and evidence IDs. A
`NOT_APPLICABLE_WITH_REASON` row carries negative reach proof. `UNKNOWN`
blocks certification.

## Segmented customization manifest

`manifest/index.json` is the generated pivot. It points to:

- `manifest/controls/<control-id>.json`, which exclusively owns public domain,
  tier, static/DB ingress, declared outputs and calibration;
- `manifest/groups/<group-id>.json`, which exclusively owns a finite recipe or
  anatomy vocabulary and its invariants; and
- `manifest/families/<canonical-family-id>.json`, which exclusively owns
  control applicability, output-to-part bindings, public props/slots, host
  adaptation, states, invariants, evidence and premium proposals for one
  canonical family.

No control or group file hand-lists consumer families. The family file owns the
edge, and the index derives reverse views and rollups. This keeps one semantic
owner with many consumers without duplicating the relationship in two files.

A bootstrap contains one `INVENTORIED_ONLY` record per canonical family and a
`UNKNOWN` cell for every active control on every family -- currently 255 records
and 5,100 cells. It awards zero progress. A proposed premium
feature has `countsAsCapability: false` until it is adopted through an existing
authority or an owner-approved additive API.

Theme controls, recipes/anatomy and instance APIs are different mechanisms. A
theme control changes paint or bounded metrics through the tenant pipeline. A
recipe or anatomy variant selects a finite structure through typed data, props
or root attributes. Instance props and slots configure one usage. Structural
choices such as table versus cards, the presence of actions, card anatomy or
preview rails must not be encoded as CSS tokens.

## Completion state machines

Control lifecycle:

`PROPOSED → LOWERED → CANARY_VERIFIED → PROPAGATED → ACCEPTED`

Family/control lifecycle:

`UNKNOWN → IMPLEMENTED → COMPUTED_VERIFIED → SIGHTED_ACCEPTED`

`NOT_APPLICABLE_WITH_REASON` is terminal only with a source-bound negative
proof. `SOURCE_TOUCHED`, `TESTS_ONLY`, a green unit test or a screenshot is
never a lifecycle state.

A family is DONE only when:

- identity and ownership resolve to one canonical family ID;
- every applicable public control has one unique causal path;
- expected parts, states and property groups are explicit;
- static and DB stops produce equivalent normalized outputs;
- computed evidence proves intended deltas and negative controls;
- baseline → mutation → removal restores variables, root attributes and
  computed values exactly;
- applicable viewport/container, locale/RTL, content, input, forced-colors and
  reduced-motion cases pass;
- evidence is bound to the frozen source and artifact hashes; and
- Kimi K3 (DT) performs final sighted acceptance, with Fable 5 independent
  closure audit.

Programme closure requires an honest disposition for every family in the active
inventory. A family
may be assessed as not elevated only when the evidence says why; it may not be
called accepted to improve a percentage.

## Test truth policy

A red test is an observation, not permission to change source or expectations.
Before action, classify it:

| Class | Meaning | Allowed action |
|---|---|---|
| `CURRENT_CONTRACT` | current authority, correct scope, positive control and source binding | fix source |
| `AGED_EXPECTATION` | mechanism is valid but expected architecture/value is retired | update expectation with counterfactual control |
| `INVALID_MECHANISM` | instrument cannot measure its claim | fix the instrument only |
| `UNVERIFIED` | important but missing authority or reliable evidence | no source or expectation change |

Every failure record requires `authorityRef`, `measuredScope`, `sourceSha`,
`positiveControl` and `allowedAction`. A missing field makes the action
`NONE`. Tests do not award visual quality points.

The first frozen full-suite reconciliation at
`fb1e200ca7544e4b373bff28f50731fdb8a1609b` exited 1 after 2,375.66 seconds:
17 files and 25 tests failed, while 1,176 files and 13,046 tests passed and 16
tests were skipped. This is a baseline observation, not a repair queue. Each
failure must enter the truth policy above before it can authorize any edit.

Execution gates are ordered and non-overlapping:

1. schema, source census and exact active-inventory family partition;
2. one-control static/DB calibration, negative controls and exact restore;
3. representative recipe/anatomy calibration on three families;
4. family-once focal and computed cohorts of at most 25 families;
5. complete control/family edges, recipe groups and channel liveness;
6. one frozen reconciliation suite plus responsive, RTL, accessibility,
   motion and sighted browser evidence.

Source regexes and tests that merely prove fixture readiness cannot satisfy a
computed or sighted gate. A later gate consumes lower-level receipts; it does
not rerun an implementation loop for every earlier assertion.

## Current checkpoint

<!-- lane-control:program-state v1 — DO NOT EDIT BY HAND. Rewrite it with:
     node packages/core/src/tooling/lane-control/public/program-state/index.mjs --write --intent <intent.json>
     head=66012af28 written=2026-08-27T11:55:05.623Z intent=38abaf567a085f9f render=5f5b0e513434797f -->

*Everything in this section is intent. Anything derivable is derived by command, not typed here.*

**Current wave:** F3 — la pintura vive en las skins: la superficie de migración medida quedó DRENADA por completo (2026-08-27; asientos en §13 del roadmap). Piloto v3 (cell-renderers, cero-delta), cohorte Typography/runtime (la matriz de rol sale del inline modern vía flag includeRoleMatrix — la factorización era imposible bajo el validador), mini-lotes C-02 (clear-button entra a la ley de densidad) y C-02b (la clearance deriva de la geometría del botón; el offset ganó su seed única); presence descalificado (gobierno nuevo, no traslado). La clasificación medida del pool supersede a las cifras históricas: 97 ocurrencias de producción, 31 dinámicas legítimas por mecanismo, superficie genuina de un dígito. Lo que queda del frente es el eje craft (pasada Quiet Premium por familia), cuya apertura como cohortes espera la revisión Codex del hito (consulta empaquetada, relevo por el owner).

**Blocked on:** Nada bloquea la cohorte siguiente. Diferidos con dueño (capa de contrato/validador, no de migración de pintura): channel-liveness (49 findings) y lane-control-drills (10/13) vuelven a blocking cuando existan sus enumeradores; la propagación mode-aware de la decisión 18 y el validador APCA cascade-aware son F5; la pregunta sighted del glass de bithire sobre backdrop oscuro es de F4C (evidencia A/B ya producida). Decisiones del owner pendientes, sin apuro: el valor del --ds-input-md-line-height de bithire (forma adjudicada: ratio sin unidad, dueño typography.scale; recomendación DT: preservar 1.5385 como ratio seed, identidad exacta) y la pregunta satélite de la capa base. El stash pre-programa sigue owner-gated.

Active packets:

| Lane | Work | Model | Reason for the model |
|---|---|---|---|
| authority | Keep one human entry point, machine contracts and honest derived status; retire competing prompts, roadmaps and checkpoints after their unique facts are migrated. | kimi-k3-dt | This packet changes programme authority and deletion boundaries, so it requires source audit, dependency analysis and final local commit ownership — held by the Kimi K3 DT under the explicit owner order of 2026-08-23 (docs/prompt-dt-fresh-session-2026-08-23.md). History: Codex held the seat until the identity reconciliation (owner order 2026-08-20, roadmap §12 decision 13), Kimi K3 held it until 2026-08-21 (quota exhaustion; the documented backup DT Codex was activated), and Kimi K3 holds it again from 2026-08-23, with Codex remaining as a low-frequency read-only technical consultant. Fable 5 remains the sole independent read-only auditor, so DT != auditor holds with Kimi K3 in the seat. The 2026-08-27 succession (docs/prompt-dt-succession-2026-08-27.md) did not change hands between models: the same Kimi K3 seat moved from terminal 1 to terminal 2 on quota exhaustion, with exactly one DT authority before, during and after. |
| control-calibration | F4B is complete in its honest form (all twenty public controls settled: nine COMPUTED_VERIFIED, ten SOURCE_BOUND, chrome.families BY_REFERENCE umbrella — see roadmap §13). What remains for the SOURCE_BOUND controls to rise (propertyGroup ratification, cell calibration) is F4C/F5 work, not this phase. | strong-implementation | The packet spans schemas, both compiler paths, CSS ownership and browser evidence; it is bounded but not a mechanical substitution. |
| family-closure | F3 is underway in coherent cohorts (Codex law, adopted: one derived-chain regeneration per lot close, not per micro-edit; no second lot opens before the pilot closed — it closed 2026-08-27). Next cohort: Typography/runtime (the residue that shadows the skin every render) with its own zero-delta proof. The measured classification of the F3 universe lives in roadmap §6/§13. | disjoint-family-writers | A family packet becomes mechanical only after applicability, stops, parts, invariants and evidence commands are closed by the calibration work. |
| advisory-audit | Independently try to refute control semantics, family applicability, evidence mechanisms and retirement proofs without editing the programme. | fable | Fable is the independent auditor at each front's close (owner order 2026-08-20, decision 13: DT ≠ auditor). Advisory prose is never authority and only reproduced source findings enter the canonical tree. |

**Refused:** the retracted CSS-basename rescope · SOURCE_TOUCHED as progress · a second product control for an existing concept · family-private customization outside the manifest · full-suite repair loops before failure classification · broad family propagation before static DB and restore calibration · R7 execution

The operational traversal is two-axis: calibrate each public control on representative families, then close each canonical family once against the stabilized full applicability matrix.

The full suite is a reconciliation signal. Packet gates are causal and focal; every red test is classified before source or expectation changes.

Historical receipts remain immutable evidence. Historical Markdown is not an active authority.

Las suites de drills de tooling no son concurrencia-seguras entre sí (flaky medida bajo concurrencia en el postaudit del piloto F3, verde en limpio por duplicado): la batería corre en serie.

### Derived at write time

*Produced by the command that wrote this section. Never typed, never edited.*

*These figures change only when somebody changes what this section is about, so a
disagreement between them and the repository is a real finding. Facts that move with
ordinary work — HEAD, the file count, what the lanes have written — are deliberately
absent: pinning them here would make this document stale the moment it was committed.*

| Fact | Value | Derivation |
|---|---|---|
| `inventory.families` | 255 | packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory.json rows.length |
| `manifest.controlFamilyCells` | 5100 | packages/core/manifest/index.json denominators.controlFamilyCells |
| `adjudication.accepted` | 0 | packages/core/manifest/index.json rollups.familyReviews.accepted |
| `adjudication.assessedNotElevated` | 0 | packages/core/manifest/index.json rollups.familyReviews.assessedNotElevated |
| `adjudication.unreviewed` | 255 | packages/core/manifest/index.json rollups.familyReviews.unreviewed |


## Active packet: spacing.rhythm

`spacing.rhythm` is the first calibration slice because it already exists as
a Standard public control, both ingress paths share the same factor table, its
stops are falsable (`tight=0.85`, `normal=1`, `airy=1.2`), and it needs no
new name or tier decision.

The slice must:

1. freeze the operational registry, compiler table and family inventory;
2. produce a disposition for every family in the active inventory without
   treating absence as N/A;
3. run a fail-closed property classifier that proves the complete current set
   of forbidden capacity, size and touch-target readers, then remove every
   confirmed off-contract DashboardInsights `block-size` rhythm read (eight
   are currently known) so rhythm changes spacing rather than cropping;
4. prove static/DB equivalence for all three stops;
5. prove computed gap deltas first on canonical Flex, Grid, Stack and Space;
6. prove numeric gaps, control height, touch targets, icon size, typography,
   color, border and motion remain fixed;
7. prove monotonicity and the density × rhythm × type-scale responsive matrix;
8. prove exact restore for normalized output, variables, root attributes and
   computed properties; and
9. obtain DT (Kimi K3) sighted acceptance before propagation is credited.

Valid enum stops currently share `TENANT_THEME_RHYTHM_FACTORS`, but invalid
input handling, effective CSS clamping and exact static/DB parity remain claims
to prove in this slice. They are not inherited acceptance.

Second slice is the `edge` axis inside the existing Pro
`profiles.expressive` capability, not a capability ID named
`profiles.expressive.edge` and not a new `surface.edge` API. Its stop semantics
and tier must be adjudicated before any rename or promotion. `palette.seeds` is
the global high-leverage closure after the method is calibrated.
`motion.character` stays proposed until the existing motion authorities are
consolidated.

## Resume algorithm

1. Read this file.
2. Run `git status --short`, `git rev-parse HEAD`, the programme check and
   the checkpoint check.
3. Read `program.json`, `checkpoint.intent.json`,
   `customization-model.json`, and only the active round/slice records.
4. Verify the family inventory and current control registry from source.
5. Inspect the latest source-bound receipts; never trust a prose percentage.
6. Classify any red test before changing it.
7. Work one control slice at a time with disjoint file ownership.
8. Update the machine records and this generated checkpoint, audit the cached
   diff, then request explicit owner authorization before any local commit.

Do not restart historical waves, infer status from filenames, or create a new
handoff document. A successor updates this tree.

## Mechanical-lane safety law

Make only the edits enumerated in the substitution table. Never declare a token name that is not in
your table — above all, never declare a name that currently appears only inside `var()` fallbacks.
Do not reorder, reformat, dedupe, rename, or fix anything adjacent; every out-of-scope observation
is a written finding, not an edit.

A lane is mechanical only after value parity is proven across all applicable
verticals. Cheap, build-free source and differential checks run per lane.
Builds, servers and browsers are serialized at reconciliation points.

## Roles

- **Kimi K3** is the DT/coordinator: resolves disagreements, owns the
  canonical programme tree, verifies every delegated packet (diff, battery,
  seals) and authorizes packets, committing bounded lots locally under the
  owner's standing order — it never pushes.
  - Succession: **Codex** held this seat until the explicit owner order of
    2026-08-20 (decision 13 of the sequencing amendment), which transferred it
    to **Kimi K3**. The owner order of 2026-08-21 then returned it to **Codex**,
    activating the backup DT documented in `docs/prompt-codex-continue.md`
    after Kimi K3 exhausted its quota. The explicit owner order of 2026-08-23
    (`docs/prompt-dt-fresh-session-2026-08-23.md`) transferred it back to
    **Kimi K3**, leaving Codex as a low-frequency read-only technical
    consultant. Each seat was transferred, not removed — exactly one DT
    authority exists before, during and after every succession.
- **Codex** is the low-frequency read-only technical consultant from
  2026-08-23: executive review at the close of a long packet run, at a phase
  close, or before a hard-to-reverse architecture decision. It holds no gate,
  no audit seat and no write authority; its review advises the DT and never
  substitutes the Fable 5 per-packet audit, and its unavailability never
  blocks work already covered by this tree and the Fable audit.
- The **Claude implementer pool (Sonnet/Opus)** is the sole implementer for
  source changes delegated by the DT, working through tmux terminals with the
  model tier chosen by risk. No other model may write programme source,
  contracts, manifests or evidence.
  - Succession: **Kimi 2.7** held this seat until the explicit owner order of
    2026-08-17, which transferred it to the Cloud Opus implementer pool. The
    owner order of 2026-08-20 then expanded that pool into the Claude implementer pool (Sonnet/Opus). The
    seat is transferred, not removed —
    exactly one implementer authority exists before, during and after both
    successions.
- **Fable 5** is the sole independent read-only auditor, performing the
  closure audit at the end of each front. Its narratives are ephemeral
  inputs; accepted findings are reproduced against source and recorded in the
  owning JSON. It creates no programme authority.
  - **Kimi K3 left the read-only audit seat on 2026-08-20** because it
    assumed the DT seat: DT is not the auditor (decision 13) is a
    conflict-of-interest fence, not a removal of audit capacity — the
    capacity is consolidated in Fable 5, which remains independent of the DT.
    The same fence bound Codex while it held the DT seat (from 2026-08-21 to
    2026-08-23) and binds Kimi K3 again while it holds the DT seat from
    2026-08-23.
  - **Kimi K3 holds the DT seat again as of 2026-08-23** and therefore does
    not re-enter as auditor or writer. Naming Kimi K3 as successor discharges
    the `kimi-capacity-removal-lacks-successor-or-death-proof` stop condition
    by a named successor rather than suppressing it; Fable 5 keeps its full
    independent audit capacity across all three DT successions.
- Mechanical writers receive disjoint, pre-proven ownership only.

Disagreement is recorded as a finding and resolved against source. Model names
never override evidence.

## Fences

- Modern Rescue executes R0–R6 only. R7 remains machine-documented with
  `enabled: false` until a future explicit owner authorization.
- Never push.
- **No stage, commit or merge** without an explicit owner order for that exact
  change. An "audited packet" is not permission to commit; it is a prerequisite
  for requesting the order.
- Classic and Rustic are read-only.
- No tenant selector, tenant-conditional component tree, second compiler,
  second icon supplier or application-private DS patch.
- No family writer mints public `--ds-*` channels.
- No generated artifact, baseline or evidence receipt is hand-edited.
- No test is weakened to preserve a defect.
- No destructive Git operation, broad staging or unrelated cleanup.
- Files=0, stale source, wrong scenario, root fallback, unresolved sentinel,
  nondeterminism, overflow, incomplete binding or missing artifact is FAIL.

Historical evidence may remain immutable. Historical human roadmaps, prompts,
checkpoints and handoffs do not.
