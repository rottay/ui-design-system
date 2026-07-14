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
  every component under `packages/core/src/components/` with counted inline paint (same property-
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

#### WO-SKIN-06 execution state (2026-07-13)

Decomposed into **9 checkpoints**, fully inventoried. The plan is
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
| CK-H2 | misc | 216 | inert pre-step certified (`28421f66`) — 25/25 anatomy, 30 stable production baselines; migration next |
| CK-I | long tail (surfaces) | 397 | contract adjudicated (`77c9a202`) — forms EXCLUDED (already CK-D); averted a clobber |
| CK-E / CK-H1 | visualization / brand-preview trio | 308 / 237 | LAST — deferred until the exemption machinery is observed executing |

**The pipeline that works** (three migrations in parallel is the unlock): inventory → contract
(orchestrator) → **inert pre-step** (anatomy + torture section + spec + contract test; baselines
recorded on the PRODUCTION build and re-run once for stability; commit) → migration → **orchestrator
wires the entrypoints** (the ONLY shared file — reserving it is what lets N migrations run at once,
and `skins.unwired` fails the build if it is forgotten) → certify.

**Proving a pre-step is inert is mechanical, not a judgement call**: re-run the paint counter against
a stashed tree and diff. Byte-identical counts ⇒ zero paint moved. Do not eyeball a diff.

**Category-B exemptions are live** (`roadmap/skin-exemptions.json`, 25 files, floor 101). The gate
enforces a FLOOR per file — a file may not drop BELOW it, because that means paint whose value is
runtime data was migrated into CSS, where it cannot live. It was a glob until 2026-07-13, and the
gate **skips globs**, so it protected nothing while looking like it did.

### WO-SKIN-07 Skin-adoption program certification + release
- Full core suite (respect the standing failure ledger), full visual suite, `--check`, docs
  contract pages extended per batch (the data-part-contracts README grows with each WO), minor
  version publish + app repins, and the stage-2 backlog handoff (consolidated proposals list).
- **Size** — M.


## Measured census (2026-07-11, WO-SKIN-01 — roadmap/skin-census.json is the machine artifact)

Fleet: **164 components, 376 files, 6300 paint sites** (~11x the ARC-09 surface). Ratchet live:
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

WO-SKIN-06 is 57% of the fleet — SPLIT IT at claim time (recommendation: 06a patterns/data+forms,
06b patterns remainder, 06c structures+surfaces; the census JSON carries the per-component
assignment either way). Top single components: dashboard-insights 259, DatePicker 154,
data-terminal-card 149, tenant-preview 147, Select 143, surfaces/pages/workspace 141.

Start order: 01 strictly first (everything else derives its file lists from it); 02 before the
rest (it dissolves suppression interplays the later batches would otherwise have to reproduce);
03-06 parallelizable pairwise where files are disjoint; 07 last. Statuses change ONLY via
`scripts/roadmap-status.mjs`.
