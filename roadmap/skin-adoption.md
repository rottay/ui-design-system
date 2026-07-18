# Lane: fleet-wide skin adoption (WO-SKIN)

Owner approval 2026-07-11: extend the WO-ARC-09 machinery to every remaining component that still
paints inline, so the `data-part` re-skinning surface covers the whole catalog. Two-stage law
(owner-ratified): this lane is STAGE 1 — byte-exact plumbing only, zero visual change, defects
filed as proposals never fixed mid-migration. Stage 2 (deliberate visual improvement over the
now-legible CSS, the P-63..P-68 backlog) is a separate later program.

Normative context: `docs-engineering/engineering/design-system/runtime/skins/README.md` (the
authoring law) + `data-part-contracts/README.md` (the public contract). The proven pipeline per
batch: inventory (sonnet, read-only) -> cascade contract (orchestrator-tier model resolves EVERY
collision before delegating) -> inert pre-step (sonnet: stamps + torture `?flag=1` section + spec
+ contract test; counters unchanged) -> record baselines (production build, singleton; kill :7001
first; stability re-run) -> migration (opus for components with cascade traps: style landing on
skin-painted elements, imperative/useState state paint, Text color sites, child-primitive
injection; sonnet acceptable for pure-static leaf components) -> byte-exact gate (rest + every
interaction state photographed) -> per-component real-engines ratchet test.

Cascade laws that bind every WO here: P-48 border floor -> painting borders at (0,4,0); composed
Text color moves only to a selector at (0,5,0) or higher so it beats the Typography engine skin
(P-87); suppression rules escalate above the landing skin's max
state specificity; keyframes namespaced in skins; per-instance `<style>` tags preserved verbatim;
classic untouched; caller className/style semantics unchanged.

### WO-SKIN-01 Fleet census + paint-counter machinery extension
- **Outcome** — The exact migratable surface is measured, not guessed: a census script/pass lists
  every component under `packages/core/src/ui/` with counted inline paint (same property-
  name classes as `arc09.inlinePaint`), per file, engine-split vs agnostic, with its trap classes
  (imperative/useState state paint, Text color sites, child-primitive style landings, keyframes,
  portals). `engine-token-audit.mjs` gains the full fleet file list with per-file decrease-only
  baselines (extend `ARC09_PAINT_FILES` or supersede it with a generated list). The census output
  assigns every component to one of the category batches below and marks its migration tier
  (opus-tier trap component vs sonnet-tier static leaf).
- **Acceptance gate** — census committed as a lane artifact; counter baselines added for every
  fleet file; `--check` green; batches below updated from hypothesis to measured lists.
- **Size** — M.

### WO-SKIN-02 Skin adoption: inputs batch
- Primitives/inputs not yet skinned (Select, Textarea, InputNumber, DatePicker, TimePicker,
  Checkbox, Radio, Switch, Slider, Upload, ... — census corrects this list; Input already done in
  ARC-07). Highest tenant-reskin value; also removes the largest class of suppression rules
  (ARC-09 components suppress input/select skins today — each input migrated here makes those
  interplays legible).
- Batched: several small primitives share ONE record cycle and ONE gate cycle (the build singleton
  is the bottleneck, ~15-20 min per cycle). Each component still gets its own skin file, contract
  stamps, and real-engines test.
- **Size** — XL (split into 2-3 checkpoints by the census if the site counts demand it).

### WO-SKIN-03 Skin adoption: feedback batch
- Alert, Toast (beyond its ARC-07 channels), Progress, Skeleton, Spin, Modal family, Drawer,
  Notification, Tag/Badge remainder... (census corrects). Includes the overlay-adjacent feedback
  chrome.
- **Size** — L.

### WO-SKIN-04 Skin adoption: overlay + navigation batch
- Dropdown, Tooltip, Popover, ContextMenu, Sheet, Tour, Menu, Tabs remainder, Breadcrumb, Steps,
  Pagination... (census corrects). Portal-rendered trees need the standalone-selector idiom
  (option-icon precedent) — expect opus-tier throughout.
- **Size** — XL.

### WO-SKIN-05 Skin adoption: display + layout batch
- Typography (paint OTHER than color), Avatar, Image, Timeline, List, Statistic, Divider, layout
  primitives with default chrome... (census corrects). Mostly sonnet-tier statics.
- **Size** — L.

### WO-SKIN-06 Skin adoption: patterns + structures remainder
- Every pattern/structure outside the ARC-09 six that carries counted paint (kanban, charts
  chrome — NOT the D3 svg internals, decide the fence in the census —, form-builder, command
  palette, headers/toolbars...). The census decides what is genuinely migratable vs exempt
  (runtime-measured, canvas/svg data-driven paint stays).
- **Size** — XL.

#### WO-SKIN-06 execution state (2026-07-14)

Decomposed into **10 checkpoints**, fully inventoried. The plan is
`skin-adoption/wo-skin-06-plan.md`, which **REPLACES the triage's §6 decomposition** — the triage
grouped clusters "by shared vocabulary" and **every cluster inventoried falsified that premise**.
The root cause was the same each time: **sharing was inferred from similarity.** Expect ONE TOKEN
SET PER COMPONENT; unification is a separate design pass with its own baselines.

| ckpt | scope | sites | state |
| --- | --- | --- | --- |
| **CK-D** | forms + record + workflow + form-surfaces | 591 | CERTIFIED byte-exact (`4418cc9f`) |
| **CK-B** | headers (5 structures + 4 patterns/misc) | 334 | CERTIFIED byte-exact (`475cf1fb`) |
| **CK-A** | dashboard widgets | 439 | CERTIFIED byte-exact (`ecfa1ad5`) |
| **CK-G** | navigation patterns | 279 | CERTIFIED byte-exact (`67ff3f35`) |
| **CK-F** | communication | 271 | CERTIFIED byte-exact (`9d85264c`) — banked P-87 (color-on-`<Text>`=(0,5,0)) |
| **CK-C** | workspace chrome | 466 | CERTIFIED byte-exact (`f0046708`) — 12 skins; 458/466 counted sites moved, 8 deliberate P-88/shared-token residuals |
| **CK-H2** | misc | 216 | CERTIFIED byte-exact (`c229859c`) — 9 skins; 213/216 counted sites moved, 3 deliberate caller-precedence residuals |
| **CK-I** | long tail (surfaces) | 397 | CERTIFIED byte-exact (`8a5afeec`) — 43 files; forms excluded (already CK-D); OAuth hidden channel recovered by addendum |
| Recovery | hidden inline/embedded CSS + orphan channels | 130 + 195 + addenda | CERTIFIED — inline 130 reconciled as 96 false positives + 14 static migrations + 20 exact runtime floors; embedded CSS 202 → 7 with 195 declarations moved; core/Showroom builds, audit, focused suites and 99-case visual matrix ×2 green |
| **CK-H1** | tenant/branding previews | 235 → 45 | CERTIFIED byte-exact (`74d6e151`) — 4 skins; 190 static sites moved, 37 runtime-paint + 8 non-paint identities preserved; core/Showroom builds, audit, focused suites and 8-case visual matrix ×2 green |
| **CK-E** | visualization | 478 → 111 | CERTIFIED byte-exact (`506d065f`) — 23 skins; 367 static/finite-state sites moved, 50 inline + 61 runtime-SVG identities preserved; focused suites, core/Showroom builds, audit, artifacts and 14-case visual matrix ×2 green; independent review clean |

**The pipeline that works** (three migrations in parallel is the unlock): inventory → contract
(orchestrator) → **inert pre-step** (anatomy + torture section + spec + contract test; baselines
recorded on the PRODUCTION build and re-run once for stability; commit) → migration → **orchestrator
wires the entrypoints** (the ONLY shared file — reserving it is what lets N migrations run at once,
and `skins.unwired` fails the build if it is forgotten) → certify.

**Proving a pre-step is inert is mechanical, not a judgement call**: re-run the paint counter against
a stashed tree and diff. Byte-identical counts ⇒ zero paint moved. Do not eyeball a diff.

**Exemptions are executable and channel-specific** (`roadmap/skin-exemptions.json`: 42 entries
across 41 files; `inlineFloor=126`, `runtimeSvgFloor=71`, `embeddedCssFloor=7`). The gate enforces each floor per
file and per channel: runtime-authored paint cannot be moved into static CSS, SVG paint cannot
substitute for an inline floor, and the one bounded embedded-CSS contract cannot absorb debt from
another file. The original glob loophole was removed on 2026-07-13. CK-E's full 61-site
runtime-SVG floor is registered per file and certified at the exact post-migration boundary.

### WO-SKIN-07 Skin-adoption program certification + release
- Full core suite (respect the standing failure ledger), full visual suite, `--check`, docs
  contract pages extended per batch (the data-part-contracts README grows with each WO), minor
  version publish + the gated BitHire repin, deferred-consumer release markers,
  and the stage-2 backlog handoff (consolidated proposals list).
- **Size** — M.

#### Stage-2 handoff and release boundary

Stage 1 deliberately preserved existing pixels and behavior. Its discoveries remain explicit work;
certifying the skin move does not silently certify those defects as product decisions:

Two earlier audit findings also remain as transversal carryovers after factual amendments:

| proposal | status | owner lane | Stage-2 handoff |
| --- | --- | --- | --- |
| P-38 | OPEN | architecture / public API | Preserve `Modal`/`OverlayModal`; converge the duplicated implementation or ratify tested differences. |
| P-39 | OPEN (terminal-chain only) | gates / audit | Add an unterminated scalar `var()`-chain counter; the motion-shorthand half is withdrawn. |

| proposal | status | owner lane | Stage-2 handoff |
| --- | --- | --- | --- |
| P-63 | OPEN | product / visual | Repair Table chrome and focus states with new fixtures and sighted baselines. |
| P-64 | FIXED | authoring contract | Canonical skin/data-part law landed at docs commit `d76024f`; WO-SKIN-07 extends it through WO-SKIN-05/06. |
| P-65 | OPEN | product / accessibility | Decide whether to re-enable suppressed Input focus and close-button hover paint. |
| P-66 | OPEN | engine parity | Make classic Text exact or document the accepted lossy color contract. |
| P-67 | OPEN | engine parity / runtime | Reconcile DetailPanel status color, pulse and interaction behavior. |
| P-68 | OPEN | product / public API | Resolve dead DataTable paint, resize token and Card selection props. |
| P-69 | PARTIAL | gates / audit | Keep the focal-green A/B hairline probe; extend deterministic font loading to the remaining screenshot specs. |
| P-70 | OPEN | token architecture | Replace transcribed literals with semantic tokens under deliberate tenant baselines. |
| P-71 | OPEN | product / engine correctness | Resolve the input-family defects individually; do not fold them into skin adoption. |
| P-72 | OPEN | product / runtime correctness | Reconcile notification, drawer, modal, toast, progress and skeleton behavior. |
| P-73 | OPEN | token / cascade architecture | Restore an actually tenant-themable Steps contract. |
| P-74 | OPEN | public API / composition | Align Stepper, Breadcrumb and Tabs docs, types and all three engines. |
| P-75 | OPEN | product / visual | Fix modern Avatar sizing/clipping with sighted baselines. |
| P-76 | OPEN | cascade architecture | Repair layer order only with a fleet-wide app override audit and re-baseline. |
| P-77 | OPEN | runtime correctness | Make DataTerminalCard deterministic across SSR and hydration. |
| P-78 | OPEN | runtime correctness | Compose Tooltip placement and visibility transforms instead of overwriting one. |
| P-79 | OPEN | public API / composition | Define attribute/part ownership and make forwarding honest across engines. |
| P-80 | OPEN | gates / audit | Turn skin rule/state fixture coverage into a measured release ratchet. |
| P-81 | OPEN | public API / composition | Forward documented Card attributes and repair GuidedDraftForm anchors. |
| P-82 | OPEN | token architecture | Decide whether PageShell's dormant tenant subtitle token is public or deleted. |
| P-83 | OPEN | public API / composition | Add and certify WorkbenchHeader `onBack`, or remove the unreachable UI. |
| P-84 | OPEN | engine parity | Implement or explicitly reject FormBuilder sections in rustic. |
| P-85 | OPEN | gates / audit | Teach the paint lexer to ignore type bodies inside generic arguments. |
| P-86 | OPEN | cascade architecture | Migrate the shared internal popup/menu surfaces without de-sharing overrides. |
| P-87 | FIXED | authoring contract | `(0,5,0)` composed-Text color law is in the kit and dependent contracts. |
| P-88 | OPEN | public API / composition | Provide a stable owner/slot class API and engine-parity for style landings. |

When published, the minor release is made available to every consumer, but a repin is not allowed
to bypass an app's own adoption gate. The exact release disposition is:

| consumer | current pin | WO-SKIN-07 disposition | governing gate |
| --- | --- | --- | --- |
| app-bithire | `2.18.0` | capture a same-seed `2.18.0` before gallery; repin to `2.19.0`; capture the matching after gallery, adjudicate any delta, then run full static certification | live app uses `forceEngine="modern"`; before/after evidence is mandatory |
| app-platform | `2.17.0` | do not repin; after registry publish, record `2.19.0` as the released external version for WO-EXP-07 | WO-EXP-07 remains gated by WO-EXP-05 and owner-approved delta review |
| app-evnto | `2.8.24` | do not repin; after registry publish, record `2.19.0` as the released external version for WO-EXP-10 | WO-EXP-10 remains gated by WO-EXP-09 and owner-approved delta review |

The `platform` monorepo root override (`2.8.22`) and its auth-client peer range (`>=2.7.0`) are not
app pins and do not move in this checkpoint. Deferred consumers repin only inside their app-owned
work orders with clean registry lockfiles and their own sighted evidence.

## Initial measured census (2026-07-11, WO-SKIN-01)

Historical starting snapshot: **164 components, 376 files, 6300 paint sites** (~11x the ARC-09
surface), preserved at commit `2454ef4f`. `roadmap/skin-census.json` is intentionally the **live
residual**, not that frozen start; after Stage 1 it reports `30 components / 60 files / 634 sites`,
all adjudicated by exact runtime/non-paint floors. Ratchet live:
`fleet.inlinePaint.<file>` decrease-only counters, same lexer as arc09 (shared module
`scripts/lib/inline-paint-counter.mjs`). Model tier from script-detected trap markers
(imperative paint, hover handlers, state-hover, Text color, style-into-child, keyframes tags,
portals); the per-batch contract still resolves each collision exactly.

| Batch | Scope | Comp | Files | Sites | opus-tier |
|---|---|---|---|---|---|
| WO-SKIN-02 | primitives/inputs | 25 | 56 | 1133 | 18 |
| WO-SKIN-03 | primitives/feedback | 11 | 41 | 351 | 10 |
| WO-SKIN-04 | primitives/overlay+navigation | 28 | 64 | 606 | 22 |
| WO-SKIN-05 | primitives/display+layout | 23 | 57 | 628 | 12 |
| WO-SKIN-06 | patterns+structures+surfaces | 77 | 158 | 3582 | 59 |

WO-SKIN-06 was 57% of the starting fleet and therefore executed as ten independently contracted
checkpoints rather than one shared-skin unit. The table above remains historical planning evidence;
the live residual JSON is the executable post-migration truth.

Start order: 01 strictly first (everything else derives its file lists from it); 02 before the
rest (it dissolves suppression interplays the later batches would otherwise have to reproduce);
03-06 parallelizable pairwise where files are disjoint; 07 last. Statuses change ONLY via
`scripts/roadmap-status.mjs`.

### WO-SKIN-08 Stage-2 residue adjudication sweep
- **Source IDs / phase** — DS-IMP-039, DS-IMP-040, DS-IMP-041, DS-IMP-042, DS-IMP-043, DS-IMP-044, DS-IMP-045, DS-IMP-046, DS-IMP-047, DS-IMP-049, DS-IMP-050; Phase 6.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — The W8 Stage-2 residue sweep adjudicates every recorded skin-adoption residue, absorbing the MD-DEF-04 asymmetry and the MD-DEF-05 CK-I scope audit. Much of the residue lands organically in W3-W6; this WO closes the remainder.
- **Steps** — Enumerate the recorded residues; adjudicate each (fix, exempt with basis, or absorb); fold in MD-DEF-04/05; tighten the residue gate.
- **Acceptance gate** — Every recorded residue is adjudicated to a terminal state; MD-DEF-04/05 are resolved; the skin-adoption residue gate is green with no unjustified exemption.
- **Execution control** — Rollback: Revert the residue adjudications per recorded residue; the prior skin-adoption state is preserved. Disable: Freeze the Stage-2 residue sweep claims until the W8 residue window opens and the recorded residues are re-audited. Telemetry: gate results for the WO acceptance and counter deltas in engine-token-audit. Stop if any decrease-only counter regresses or the acceptance gate cannot pass without weakening a floor.
- **Do NOT** — Do not weaken a floor or baseline to pass the gate; do not add product/domain semantics to the DS; edit-only, no commits, never git-restore directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, adjudicate the Stage-2 skin-adoption residues (DS-IMP-039..047, 049, 050) at the W8 window, absorbing MD-DEF-04/05. Gate: every residue terminal, MD-DEF-04/05 resolved, residue gate green with no unjustified exemption. Fences: edit-only, no commits, never git-restore directories.

#### MD-DEF annotations (2026-07-18 adjudication)
- **MD-DEF-03 / MD-DEF-06 / MD-DEF-07** — already done (audit-verified); recorded here for completeness.
- **MD-DEF-04 / MD-DEF-05** — folded into WO-SKIN-08's acceptance scope (the asymmetry and the CK-I scope audit).
