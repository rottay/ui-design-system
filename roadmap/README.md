# Design System Roadmap — Modern Engine Premium Uplift

- **Status**: canonical operative backlog. Takes the `modern` engine from its audited state
  ("hand-made, mid-tier; near-indistinguishable from `rustic`") to the Quiet Premium target.
- **Normative law** (read FIRST, it is the spec every WO implements): the modern-engine
  specification at
  [`../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md`](../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md).
  Its evidence base is the visual audit at
  [`../../docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md`](../../docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md).
- **The work** lives in the registry-linked lanes below. Counts and live state are derived in
  [`STATUS.md`](./STATUS.md) and are deliberately not duplicated here:
  - [`engine-modern.md`](./engine-modern.md) — modern-engine and release/theme-source work;
  - [`craft.md`](./craft.md) — interaction, adaptive/mobile, motion, charts, AI and spatial craft;
  - [`gates.md`](./gates.md) — visual, package, whitelabel, accessibility and program-truth gates;
  - [`tokens.md`](./tokens.md) — generated artifacts, color/token governance and legacy cleanup;
  - [`architecture.md`](./architecture.md) — behavior, ownership, package and access architecture;
  - [`skin-adoption.md`](./skin-adoption.md) — Stage-1 extraction and retroactive conformance evidence.

- **Dispatch first:** [DS-only parallel execution — owner amendment 2026-09-17](#ds-only-parallel-execution--owner-amendment-2026-09-17)
  classifies the remaining WOs, shared-file conflicts, serial boundaries and verification windows.
  It is scheduling policy inside this roadmap, not a second backlog or a change to acceptance.

  > The commercial-surfaces program (the showroom Monochrome Signature relaunch of `showroom.rottay.com`
  > + the shared `@rottay/design-system/commercial` kit, WO-SHW-01..05) lives in `roadmap/commercial/` —
  > isolated by owner decision 2026-07-07, own machinery `pnpm roadmap:commercial`.
- **Proposals inbox**: [`proposals.md`](./proposals.md) — ALL rounds approved by the owner
  2026-07-07 and converted to WO blocks, except P-07 (withdrawn). The inbox is EMPTY pending new
  proposals; new items still follow the same law (owner approves 1:1, then a `### WO-` block +
  registry entry).

## Seventeen rules learned the hard way (2026-07-09 … 2026-07-10)

Each of these was paid for. They are not style preferences.

1. **A work order is a HYPOTHESIS, not a law. The code is the law.** A survey of
   13 work orders on 2026-07-09 found 7 whose premise the code contradicts.
   Three had already been caught mid-execution: WO-ENG-08 assumed DaisyUI was
   dead (1,675 lines had real consumers), WO-GAT-03 specified side-by-side tenant
   columns (tenant, theme and `dir` are all `<html>`-anchored, so they are
   impossible), WO-ENG-12 blamed the Table primitive for an overflow that lived
   in the gallery cell above it. **The first step of every WO is to try to
   falsify itself.** `roadmap:check` proves a WO is consistent; nothing proves it
   is true. When a premise falls, amend the WO in place with an `AMENDMENT` block
   citing `file:line` — leave the original claim standing so the correction is
   auditable.
2. **A gate authored before the code was read is a trap.** WO-ENG-11's gate
   ("all section-12 counters at target") is unsatisfiable — `--check` does not
   verify those targets, and two of them are documented as unreachable.
   WO-TOK-03's gate (`grep -ri daisyui == 0`) contradicts `pnpm test`. A gate
   that cannot go green forces either a lie or an amendment. Write the gate after
   the survey.
3. **Every new gate ships with a DRILL that proves it bites.** Introduce the
   defect the gate exists to catch, watch it go red, revert, watch it go green,
   and record both in `done --evidence`. WO-GAT-03 did this and found that its
   own derivation probe was circular; the circular version reported 1 violation,
   the corrected one reported 7. A counter that has never been red is not a
   counter.
4. **Executors are edit-only; the orchestrator holds the build AND the status.**
   Build, test, and Playwright are one shared resource over one working tree. Two
   agents building concurrently produced a `.next` compiled against a half-written
   `dist`, a 500 on the probe route, and 43 spurious visual failures. And on the
   same day an executor marked its own WO `done` — no build, no `--check`, no
   sighted review. Both fences are structural, not advisory.

5. **A harness that watches for errors is not a harness that watches for
   content.** The first sighted capture of `themanagementmiami` wrote a
   plausible-looking, entirely blank PNG, and the capture script called the run
   clean: it asserted no page errors and no 4xx, and a dev-server rebuild had
   blown the React tree away between the readiness check and the shutter. Assert
   what you came to photograph is on the page **at the moment of the shot**, not
   that nothing threw on the way there. This is the same shape as the circular
   probe and the single-emitter audit: the check ran, the check was green, and
   the check was not looking where the defect was.

6. **A check that cannot see new files is a check looking where the defect is not.**
   Three times this program's own verification missed something because of *how*
   it looked, not because it did not look. `git diff` does not show untracked
   files, so an escape-hatch grep over the diff reported "none" while two
   `@ts-expect-error` sat in a new test file. `git show HEAD:` was never run
   before blaming an executor for a placeholder change that a prior commit had
   made. And an assertion that read `background-image` for the word "gradient"
   passed with the effect dial at zero, because the string survives when every
   alpha inside it does not. **Verify with the instrument that can see the thing
   you are looking for**, and prefer measuring the artifact over reading its name.

7. **`git add <paths>` does not un-stage what is already in the index.** `git mv`
   stages its rename immediately. An agent moved five files while the
   orchestrator committed an unrelated work order by explicit path, and the
   commit swept the renames in **without their import fixes** — a commit that
   does not build on its own, named after a work order that had nothing to do
   with it. Before committing during a parallel wave, `git status --porcelain`
   and look for `R`/`A` entries you did not stage. Explicit paths protect the
   *contents* of a commit, not its *index*.

8. **A parity test that regenerates an output and compares it to the committed
   copy cannot see a lie the two share.** The generator baked
   `brand-themes/<slug>.ts` into every artifact header. After the themes moved,
   that line named a file that does not exist — and `first-party-artifacts-generated`
   stayed green, because the generator and the artifact were stale *in unison*.
   Regenerate-and-diff proves the artifact is a build product. It proves nothing
   about whether the build product is true.

9. **`dist` drops an export no entry reaches.** A build script imported
   `APCA_BODY_TEXT_MIN_LC` from a private dist path. The constant is exported in
   the source and Vite tree-shook it out of the bundle, because `_internal` is
   not a package entry. The script failed at run time with a correct source tree
   and a green typecheck. If a script must read a value the library owns, that
   value has to be reachable from a real entry — re-export it from the module
   whose concern it is, and the bundler will keep it.

10. **No design-system cascade layer can paint a component.** `foundation/base.css`
   declares seven layers (`rottay-reset` … `rottay-responsive`) and then imports
   Tailwind, whose own `theme` / `base` / `utilities` layers are absent from that
   statement and therefore sort AFTER all seven. Layer order beats specificity, so
   a rule in `@layer rottay-engines` at (0,2,0) loses to preflight's
   `button { background-color: transparent }` at (0,0,1). Measured on the shipped
   bundle: the layered rule changed nothing; the identical rule, unlayered, painted.
   That is why both interactive engines painted inline. A skin must be **unlayered**.
   (P-47.)

11. **Two classes is the floor for any rule that sets `border-color`.** Every tenant
   ships an unlayered `html[data-tenant]:not([data-theme]):not(.light) * { border-color: … }`
   at (0,3,1). Every single-class component rule loses its border to it. A component
   that names its own border must reach (0,4,0) — two classes plus the anatomy part
   plus the variant. (P-48.)

12. **A baseline that never hovers certifies nothing about hover.** The 48 visual
   baselines photograph pages at rest. A skin could lose its entire hover rule, its
   press transform and its focus ring with all of them green. `states.spec.ts`
   records 216 computed cells across the current tenant × engine × variant ×
   state matrix (the older Button-only subset contains 132), and it found
   a real bug the moment it existed: the modern Button's hover set `borderColor` as a
   longhand over a `border` shorthand, and once the pointer left, the colour fell
   through to the cascade. Settle by THREE agreeing samples, not two — a spring
   approaches its target asymptotically and two samples can agree on a plateau it
   has not left.

13. **Fix a rule in every emitter, then look for the third.** `token-consumption-ratio`
   read a component's `.tsx` alone, so a skin consuming 169 `--ds-button-*` tokens
   measured zero. Fixing `scripts/audit-integration.mjs` left its twin,
   `token-fidelity.test.ts`, red — and the suite, not the reasoning, is what caught
   it. Grep for the rule's *sentence*, not its file.

14. **Look at it.** On rottay, the classic engine painted a white primary-button
   label on a white primary button — 1.00:1, an invisible label on the platform's
   own brand. It shipped. 118 gate assertions were green, because none of them
   selects an engine and the antd button does not carry the class the contrast
   gate looks for. It was found by opening a screenshot of a page nobody had
   photographed and seeing an empty white rectangle. A sighted check is not a
   formality at the end of a WO; it is the only instrument that has no schema.
   (P-52.)

15. **A token whose name says `shadow` is not a colour.** The modern Input's focus
   ring was written `outline: var(--ds-focus-ring-width, 2px) solid
   var(--ds-input-shadow-focus, var(--ds-focus-ring-color))`. That variable holds
   `0 0 0 3px rgba(255,255,255,0.10)`. Substituted, the declaration is invalid at
   computed-value time and the browser drops the whole thing — the `var()` fallback
   never runs, because the property IS defined. The outline has never painted on
   any tenant, and the ring the user sees comes from somewhere else entirely. An
   invalid CSS declaration fails silently, in every direction. (P-54.)

16. **A flaky test is a race with a name — and a RATE, not an anecdote.** "17
   failures on one run, 21 on the next" was treated as noise for months. Two files,
   run together, expose it: a `findByRole` with a 1000ms default racing a
   `React.lazy` engine chunk that needs longer under CPU contention. Two failures
   out of two observations got this written down as "deterministic"; measured, it
   is 3 in 11. The distinction is load-bearing, because a candidate fix passed that
   reproducer 15 times in a row while breaking 498 of 795 tests in a subset nobody
   had run. Measure the class, never the instance. And the fix is determinism,
   never a wider timeout — a widened window still closes on a slower machine.
   (P-49.)

17. **A counter the baseline has never heard of gates nothing.** `--check` compared
   an unbaselined counter against `Infinity`, so it could not rise and could not
   fail. It measured, printed a number, and guarded air. Every new counter must be
   seeded in the same commit that adds it, and `--check` now refuses one that is
   not.

## The current failure baseline (measured, not assumed)

> **AMENDMENT (2026-07-14, 2.19.0 release candidate):** the 17-test ledger
> measured on 2026-07-09 was correct for that checkout, but it is not the current
> allow-list. After the Stage-1 migrations and explicit root/core version sync,
> a single combined run of the exact remaining files reports **10 failed files,
> 13 failed tests and 82 passed tests**. This supersedes 17 as the release
> threshold; it does not rewrite the historical measurement.

The current set is exact:

| Count | Tests | Observed failure |
| --- | --- | --- |
| 6 | `TimePicker.integration` (×3), `TimePicker.modern-engine-advanced` (×2), `TimePicker.real-engines` (×1) | Modern's expected time inputs/handlers are absent; rustic returns the no-seconds value `09:30` where the test expects `09:30:00`. |
| 4 | `List.rustic`, `Statistic.rustic`, `Typography.modern`, `Popover.modern` advanced coverage | Assertions still require prior inline paint, utility classes or DOM/class shapes instead of the rendered skin contract. These tests remain red; the release does not weaken them. |
| 1 | `source-governance` public token mirror | Six runtime files still import or export the public token mirror. Root/core version parity is now green. |
| 1 | `whitelabel-field-coverage` | BitHire's tenant CSS still contains 25 `.ant-` selectors. |
| 1 | `PatternCommandPalette` modern advanced coverage | The modern case hits the 30-second timeout under the combined run; classic and rustic pass. |

The full suite immediately before the two release corrections reported
`502/513` passing files, `7690` passed tests, `21` skipped tests and `15` failed
tests across 11 files. The stale Card token-fidelity assertion was corrected to
read the engine together with its skin and proved 9/9; root/core version parity
was fixed and proved in the source-governance
focal. Those two corrections produce the 13-test set above, which was rerun as a
single ledger command.

The earlier **17** remains historical evidence from `9d59a97a`; it must not be
quoted as the current threshold. Conversely, the current allow-list is not a
waiver: no test outside these ten files may go red, and each listed defect must
be fixed or deliberately respecified in its own work order.

## State model (this plan cannot rot silently)

- **The spec** lives in the lane files: the six original lanes (`engine-modern.md`, `craft.md`,
  `gates.md`, `tokens.md`, `architecture.md`, `skin-adoption.md`) plus the nine post-C4 audit lanes
  adopted on 2026-09-05 (`canon-close.md`, `consumer-contract.md`, `catalog-door.md`,
  `derivation.md`, `family-cuts.md`, `emission-mount.md`, `platform-invariants.md`, `retire.md`,
  `evidence-graph.md`). **State** lives
  in [`registry.json`](./registry.json) — the ONLY place a WO status exists. **[`STATUS.md`](./STATUS.md)
  is generated** (`pnpm roadmap:status`); never hand-edit either.
- Statuses change ONLY through `scripts/maintain/roadmap/status/index.mjs` (`claim` / `progress` / `done` / `reopen`), which
  mechanically enforces the dependency graph, the `mustLandWith` sequencing hazards, and mandatory
  evidence on `done`. Do not fight refusals — they encode the sequencing law.
- `pnpm roadmap:check` (registry and lane file must agree: every WO heading registered, titles/lanes/
  deps valid, no cycles, no done-without-evidence) is the consistency gate. Run it before handing off.
- Anti-sprawl law: new work = a new `### WO-` block in its lane file + a registry entry
  (`roadmap:check` forces the pairing). **No new plan documents** — not here, not in docs-engineering.
  If a doc is not the lane, the registry, generated STATUS, or the spec, it does not exist. The ONE
  sanctioned exception is [`proposals.md`](./proposals.md) — the owner-review inbox (owner request
  2026-07-07): items there are NOT work until the owner approves them 1:1 and they become WO blocks.
- Dispositions of superseded WOs live in `notes` (`ABSORBED by`, `REFORMULATED by`, `REPLACED by`,
  `PAUSED until`) and in `dependsOn`; they are not statuses. `STATUSES` stays `todo | in-progress | done`.
  A superseded WO is closed when its replacement lands: `claim WO-old`, then
  `done WO-old --evidence "closed by WO-XXX-nn <commit>"`, in the same certified lot.
- `new_work` exception (owner-ordered spec/contract artifacts, 2026-09-05): `roadmap/kit-2026-09.md`
  (WO-CAT-01), `roadmap/family-cut-template.md` (WO-FAM-00), and the consumer contract —
  `packages/core/docs/consumer-contract/index.md` (WO-CON-01) with its
  [`protocol/index.md`](../packages/core/docs/consumer-contract/protocol/index.md) (WO-CON-05, the
  two-track operating protocol: release discipline, version pinning, and the ONE path by which an
  application asks for a capability — a `### WO-` block in its lane file, never a `_shared/` bridge)
  — are specifications and a consumed contract, not plan documents. Nothing else may be added
  outside a lane file.

### Execution and review policy — owner amendment 2026-09-12

<!-- execution-policy:start -->
**Mandatory execution policy (roadmap/README.md, owner 2026-09-12).**
This amendment supersedes older blanket instructions to run the full suite or
full certification for every lot; it does not waive a WO's substantive acceptance
criteria or final certification. State and dependencies remain in the existing
registry; denominator definitions and authorities are unchanged.

- **Writer and auditor (succession-aware):** real Opus is the primary writer;
  exactly one owner-authorized DT is the coordinator, independent code auditor
  and local integrator. Kimi is the requested successor; preserve the outgoing
  coordinator's in-flight packets until the explicit checkpoint handoff, never
  start a competing DT. The fixed admin-account assignment of 2026-09-14 is
  historical, superseded by later owner account changes; use the latest explicit
  authorization and record the effective profile/account, not an old prompt's
  label. Available quota is not permission to switch billing accounts silently.
  Nobody approves their own implementation: if the DT exceptionally writes
  product code under an explicit write-set, that code
  requires another independent auditor before integration. The ordinary
  implement/audit/integrate cycle does not wait for Fable or Codex, and no ACCEPT
  may be fabricated in their name; the shared-core review rule below is unchanged
  and still binds where it applies. Verify the executable, profile, effective
  account and real model identifier before each dispatch, never a terminal label.
  Record any succession once in the existing WO progress trail.
- **Before shared-core design is adopted:** Codex, Fable and Kimi review the SAME
  debrief: WO, base, proposed contract, owners/write set, invariants, alternatives
  and executable acceptance. Core means catalog/permissions, precedence, derivation
  and channel ownership, compilation/emission, artifact identity/persistence,
  SSR/hydration/public boundaries, shared family kernels and acceptance instruments.
  Each records ACCEPT or HOLD with evidence and authorship conflicts. Resolve
  disagreements before integrating the affected core change. A writer's agreement
  is not an independent audit. Missing reviewers mean pending, not implicit consent.
- **Current core checkpoints:** apply that review to the changed shared contracts
  in WO-CON-07, WO-EMI-02, WO-DER-06, WO-INV-04/07 and WO-EVI-01/02/04, and to any
  other WO changing the core defined above. Completed contracts are not reopened
  just to collect retrospective signatures; reopen only for a concrete finding.
  WO-FAM-01 consumes the agreed contract as the pilot. Later family cuts reuse it;
  only a proposed contract delta returns to the three reviewers.
- **Before each lot is integrated:** independently review the exact candidate diff
  and run focal tests of new/changed behavior and directly affected consumers,
  appropriate type checks and the applicable contract gates. Record commands,
  scope and results. New regressions cannot be hidden by widening baselines.
  Browser/first-paint claims require browser evidence from the lot's own package.
  Design approval does not approve unseen code. Preserve active drafts/checkpoints;
  never reset or overwrite another writer's work.
- **At important milestones:** run the complete suite on a pinned integration
  commit for the first end-to-end pilot, relevant family/shared-core wave closures,
  and final certification/release. Reuse that result for the lots it covers, not
  one full run per writer. Expand a focal regression scope when a concrete
  cross-cutting failure warrants it. Never represent focal evidence as a full pass.
- **Parallelism and cost:** one complete component per writer (deriver, skin,
  runtime and tests) within the same block, only with disjoint files and stable
  shared contracts. Shared compiler/catalog/registries have one owner. Serialize
  integration/commits and heavy builds/suites/browser runs on this host; wait for
  completion events instead of continuously polling.
- **DS-only focus and mandatory safe parallelism (owner 2026-09-17):** read
  `roadmap/README.md` section **DS-only parallel execution — owner amendment 2026-09-17**
  before dispatch, and include its applicable WO row and conflicts in the bounded brief.
  There is NO fixed agent-count ceiling: dispatch every useful independent packet
  that has satisfied dependencies/phase permissions, a stable consumed contract,
  an exclusive write set, an independent reviewer and a scheduled validation slot.
  If any condition is unknown, do not guess or dispatch overlapping writers.
  Route that dependency to its owner and dispatch another ready packet instead.
  Work on the owner's active execution checkout on main (currently
  `/Users/daniel/Developer/Rottay/r4-recon-opus`); historical prompts naming
  `/Users/daniel/Developer/Rottay/ui-design-system` are not a checkout-switch order.
  Do not create coordination branches/worktrees or restart completed work.
  No new unrelated programme work; preserve any already-running foreign work.
- **Evidence and landing:** record debrief version/hash, each review and the tested
  candidate; link them from the existing WO progress/done evidence via the roadmap
  script. No shadow backlog or new status. The sole DT lands audited functional commits
  locally on main; never push, never restore directories, never sweep foreign
  staging. No emojis or AI attribution; keep applicable product documentation
  current. The three-way agreement
  is NOT yet obtained merely because this policy is documented.
<!-- execution-policy:end -->

## DS-only parallel execution — owner amendment 2026-09-17

### Authority and dispatch decision

Owner direction: focus available execution capacity on completing the Design System;
parallelize as much as is safe, with no arbitrary limit of two, three, five or any
other number of agents. Quality and substantive acceptance do not decrease.
This section supersedes conservative *scheduling* defaults, not dependency edges,
phase locks, public-contract approvals, account authorization or WO closure criteria.
It does not authorize terminating other processes, editing other repos, publishing
or pushing. Already-running work is preserved and reconciled at handoff.

Use `registry.json` through `next`/`show`/`claim` to determine current eligibility.
The following tables are conflict/scheduling rules, NOT another status register.
They cover the 47 open WOs observed when this amendment was drafted; a completed
row is not an instruction to reopen it. New scope must enter the existing machinery.
The registry DAG is necessary but insufficient: disjoint files can still conflict
through a changing contract, generated output or shared test/build environment.

**Dispatch only if all six answers are yes:**

1. Is the WO claimable under actual dependencies, phase controls and authority?
2. Is this packet useful now, with no unresolved assumption about its consumed contract?
3. Does one named writer exclusively own its exact files, including tests and skin?
4. Are shared registrations, exports, generated files and read-dependency conflicts assigned?
5. Is a reviewer independent of the implementation assigned, with capacity to review it?
6. Is there an agreed validation/integration window on a stable candidate?

Otherwise record the specific wait in the existing WO progress and choose another
ready packet. Preparation may inspect a future WO read-only, but is not a claim,
implementation permission, speculative contract or proof of completion. A real
block affects its dependency closure, not all unrelated work.

The DT reads the current handoff once, preserves active file reservations, dispatches
bounded packets and waits for completion events. It does not run minute-by-minute
status loops or restart repository-wide audits after every delivery. No worker
commits, stages, claims completion, changes shared contracts unilaterally or borrows
another worker's draft. Exactly one DT owns integration on main.

### Capacity, priority and first dispatch

- **No fixed concurrency cap.** Add writers while there are non-conflicting ready
  packets and real review/validation capacity. More available quota removes a
  billing bottleneck; it does not add RAM, test isolation or reviewer throughput.
  If integration, reviews or host memory become the bottleneck, drain that queue
  before opening more drafts. Do not create idle scouts merely to fill seats.
- **Prioritize unblockers:** first preserve/finish the active R17 correction packets
  under WO-FAM-08 / WO-INV-01 / WO-EVI-02, then the shared contracts that unlock
  several family packets, then complete families rather than isolated token edits.
  The R17 evidence is in
  [`2026-09-17 checkpoint audit`](../../docs-engineering/archive/audits/2026-09-17-ds-814927519-davila.md).
  Reproduce only unresolved findings; never duplicate a repair already landed.
- **Do not wait for all of FAM-08 to start FAM-09/10/11.** These are same-wave
  peers. After checking their consumed contracts against the active correction,
  dispatch their disjoint work alongside the FAM-08 closer and evidence owners.
  One root fix may block its consumers without blocking unrelated family behavior.
- **Illustrative initial allocation, not a quota:** independent FAM-08 residue
  packets; chart contract/families; form/record families; shell/workspace families;
  verification instruments. Add INV-02, INV-03, INV-08, EMI-03 or CON-06 packets
  whenever the reservations below permit. Split further only across complete,
  genuinely independent families, never deriver vs skin vs tests for one family.
- **Do not defer every shared capability until the end:** reserve the DnD/export,
  chart paint, header, i18n, motion and verification owners early. Their short
  reviewed contracts let later family adoption proceed without divergent APIs.

### Remaining programme WOs: parallel work and serial boundaries

All starts require the six-answer check. “Serial” concerns the named boundary,
not a blanket instruction to idle all other agents. Logical paths in lane specs
must be resolved to actual files before dispatch; an entire `components/**` glob
is not an exclusive file reservation for one small packet.

| WO | Work that can run concurrently | Boundary / completion rule |
| --- | --- | --- |
| WO-FAM-08 | Complete disjoint data families and named residues; export-kernel work separate from table ARIA work when their files and contracts do not overlap. | One DnD owner, one export owner. Family kernel contracts land before dependent adoption. Own tests stay with the family writer. Keep the WO open until the real family/finding acceptance passes. |
| WO-FAM-09 | Chart cohorts after the shared series-paint/geometry contract is reviewed and stable; alongside FAM-08/10/11. | One owner for chart theme/series resolver, shared geometry utilities and registration. No 18 competing paint implementations; do not split one chart's behavior from its skin/tests. |
| WO-FAM-10 | Form/record, header and lifecycle cohorts on exact disjoint files after common contracts settle. | One header/SurfaceRegion contract owner. FAM-11 reads the settled contract; shared surface builders cannot be co-edited. |
| WO-FAM-11 | Independent shell, search/command and workspace cohorts after common contracts settle. | One keyboard/provider owner; reserve shared headers against FAM-10 and collection/render-dispatch files against FAM-08. |
| WO-INV-01 | Direction/physical-property instrument repairs and disjoint family adoption. | One shared direction/overlay boundary owner; never change frozen-engine behavior indirectly. Family writers apply local RTL changes while they own those files. |
| WO-INV-02 | Catalog/formatter/font work separate from family cuts with the agreed message/locale API. | One catalog/calendar/IME contract owner. Send adoption requirements to the active family writer, not a second repository-wide edit sweep. |
| WO-INV-03 | Global accessibility floor and independent test authoring outside reserved family files. | Coordinate root CSS with EVI/root owners; gate manifest and axe harness have one owner. Component repairs go through their family writer. Actual browser runs use the host validation slot. |
| WO-INV-08 | Reviewed motion kernel and its isolated tests alongside family work. | Adoption in grid, grid-view, kanban or overlays waits for that family's reservation release; a disjoint kernel directory does NOT make its whole WO disjoint. Align FAM-12's API before integration. |
| WO-FAM-12 | Card/auto-fit work on released families, with a stable motion/adaptation contract. | FAM-08 also touches grid/gallery/widget-board. Hand off each shared directory explicitly; no simultaneous writes. Required registry deps still apply. |
| WO-FAM-13 | After FAM-08, FAM-12 and INV-08 are done (and all other declared deps). Independent of unrelated completed-family cleanup. | Sole widget-board/DnD adoption window. Never overlap RET-01 on drag-and-drop; shared DnD is owed by FAM-08, not deferred to this dependent WO. |
| WO-INV-06 | After FAM-10/11 and its responsive dependency are done; independent of unrelated chart work. | Own SurfaceRegion/posture/app-shell adoption window, with CON-06 reservation on shared consumer fixtures. SSR first-paint proof, not client-only simulation. |
| WO-DER-08 | Bounded Studio/draft transport residue independent of settled family skins. | One ingress/Theme/public-callback owner; coordinate compile and migration fixtures with CON-06, EMI-03 and EVI-02. Do not reimplement already landed migration. |
| WO-EMI-03 | Non-CSS emission over a stable ThemeCompilation; independent family skins may progress. | Core review before changing compilation/contracts; never create a second compiler. Resolve overlap with DER-08 and root fixes first; serialize shared artifacts. |
| WO-CON-06 | Migration documentation and exclusive consumer-fixture cases over the stable published seam. | Singleton ownership with DER-08 / INV-06 / EVI-02 for migration code and shared fixtures. DS fixture work is not permission to write consuming apps or release. |
| WO-DER-07 | Technical candidate/probe preparation using governed decisions; may accompany evidence work. | Final branding pick stays deferred. Resolve Q-B-DER07 through reviewed milestone machinery, not an invented pick or silently altered acceptance. Reserve probe-ground with RET-05/EVI. |
| WO-EVI-02 | Separate instruments on disjoint files; read-only evaluation of landed families. | One owner for populations, floors, runner/gate manifest and shared fixtures. Root source repair is assigned to its source owner. Fleet certification waits for actual eligible population/evidence, never substitutes a pilot. |
| WO-EVI-03 | Harness/door-parity conversion outside active family test files. | Family-local test migration travels with its cut. Coordinate liveness harness with EVI-02; identity-dependent golden regeneration waits for the approved identity. Never bless current output blindly. |
| WO-RET-01 | In wave 5, independent retirement cohorts after all declared family prerequisites and a fresh consumer census. | Shared exports/package metadata/changeset have one integrator; no removal of active app consumers before authorized migration. Never overlap FAM-13 on DnD. |
| WO-RET-02 | In wave 5, scoped dead CSS/bundle retirement after consumer evidence. | No active skin/root rewrite on the same inputs. Serialize CSS-build, package and showroom/Tailwind changes with RET-05 and artifact generation. Frozen engine content stays frozen. |
| WO-RET-03 | In wave 5, evidence quarantine separate from settled runtime source work. | Transfer every live consumer/gate to its authorized authority before moving it. Serialize gate-manifest/docs/script ownership with EVI and RET-04; preserve measured graphs/history. |
| WO-RET-04 | After RET-01 and its declared deps: disjoint internal monolith splits on released directories. | Global moves/import rewrites are a serial window across BOTH source and its importers, including tests/docs/generated path keys. No moves under active family writers; APIs preserved, no compatibility duplicates. |
| WO-RET-05 | In wave 5, probe-ground/Storybook adoption over the settled mount and family contracts. | One showroom owner; coordinate RET-02 tooling, RET-04 paths, DER-07 references and EVI browser harness. Pause shared showroom edits during captures. |

Retirement rows do not become early execution merely because `next` lists them:
the existing wave-5 consumer-census/start-order law still applies. Read-only
inventory/preparation can run earlier without deleting or moving anything.

### Remaining legacy WOs: avoid duplicate implementation

These rows retain their registry dependencies, phase permissions and source
authorities. The replacement may already be done: verify its actual evidence,
then close the old obligation through the script when claimable. Do not redo the
old recipe, automatically close a partial replacement, or count support as final
source completion. If the phase is locked, keep the closure receipt ready in the
existing progress trail and surface the precise phase-control decision early;
this scheduling amendment does not open a phase or alter its fingerprint.

| Remaining WO(s) | Scheduling / closure route |
| --- | --- |
| WO-ARC-12, WO-ARC-13, WO-ARC-14, WO-ARC-17 | Reconcile the recorded FAM-00 / EVI-01 / EMI-02 / CAT-02 replacement evidence and required old-WO ordering; no duplicate anatomy/compiler programme. |
| WO-ENG-25, WO-CRA-19 | Reconcile DER-04 + INV-05 and CAN-05 respectively; do not rebuild motion or overlay kernels. |
| WO-ARC-15 | INV-03 plus actual family adoption; do not treat a global floor as every family's accessibility proof. |
| WO-ARC-20, WO-ARC-18 | FAM-11 plus the recorded responsive contract; avoid a second workspace rewrite. |
| WO-TOK-11, WO-ARC-19 | DER-03/EVI-02 contrast and six-axis divergence evidence respectively; no palette-only shortcut. |
| WO-CRA-18 | FAM-09 chart convergence; no second chart programme. |
| WO-CRA-15, WO-CRA-17, WO-ARC-16, WO-CRA-21 | RET-01's capability, legacy-icon, extensions and marks dispositions; paused scope is not permission to add new effects. |
| WO-ENG-24 | CAN-06's frozen-engine decision; do not reopen Classic/Rustic development to consume quota. |
| WO-GAT-12 | EVI-01 + RET-03's measured graph/quarantine evidence; no historical receipt as runtime authority. |
| WO-SKIN-08 | All replacing cuts and EVI-02 must substantively satisfy its recorded closure; no second broad skin sweep. |
| WO-ARC-21 | Conserved: DB-to-first-paint proof in consuming apps, after actual phase permission and stable DS contract. DS-side preparation can proceed; app-side implementation requires an explicit authorized cross-repo packet. DS-only focus neither cancels this obligation nor silently grants those writes. |
| WO-CRA-20 | Conserved: icon weight pruning after RET-01; one generator owner, consumer proof, serialized generated corpus. |
| WO-CRA-22 | Conserved: supplier-pure root imports after RET-02; coordinate entrypoints/importers with RET-01/04 and CRA-20. |
| WO-GAT-10 | Conserved: license/provenance for retained effects after RET-01; disjoint checker work can accompany icon cleanup, but shared manifest changes are integrated once. |
| WO-GAT-11 | INV-01 + INV-03 + EVI-02's actual robustness matrix; one shared browser window, no duplicate fleet harness. |
| WO-GAT-09 | Final claim-integrity barrier, including its own certifier residuals; cannot close while another executable authority remains open or required review is overdue. |

### Conflict reservations and serial integration

Keep reservations in the owning WO's existing `progress` trail and the DT's
bounded dispatch, not a second registry or task graph. Release a reservation on
an explicit delivery/integration event, not elapsed time or silence. Independent
WOs that share any of the following require a named singleton owner:

| Shared resource | Competing work to coordinate |
| --- | --- |
| Theme, catalog, roots, ingress, compilation/emission and public contract | DER-08, EMI-03, CON-06, EVI-02 and any root repair. Review contract first; then disjoint consumers. |
| DnD / export / widget-board / grid-gallery | FAM-08, FAM-12, FAM-13, INV-08, RET-01. API owner first, consumer-directory handoff second. |
| Headers / SurfaceRegion / shell / keyboard provider | FAM-10, FAM-11, INV-06 and any INV-02 adoption in those files. |
| Family TSX, deriver, skin and its tests | A single complete-family writer; INV-01/02/03 and EVI-03 request changes through that owner, or await release. |
| Gate/roster/fan-out registries, shared fixtures and `.github/workflows/ci.yml` | EVI-02/03, INV-03, CON-06, RET-03/05 and family registrations. Writers provide exact registration deltas; the assigned owner integrates them once. |
| Build inputs, generators, dist, CSS artifacts, graph, supplier snapshots, package exports/lockfiles | One integration/generation owner; no concurrent regeneration or installation. |
| Showroom source/dev server, browser matrix, screenshot/golden paths | One stable capture window; DER-07, INV-03/06, EVI-02/03, FAM-13 and RET-02/04/05 reserve it. |
| Filesystem moves and reverse importers | RET-04 reserves the whole affected source/importer closure, not just the destination folder. |
| Git index, roadmap registry/STATUS and commits | The sole DT. Writers never use `git add`, `git mv` or whole-tree formatting. |

**Land coherent functional packets, not hundreds of loose edits.** Review the
exact candidate, verify HEAD/index/pathspec and new/untracked files, then use the
serialized test/commit window. A pass that depended on another writer's
uncommitted dependency does not certify the candidate commit. If the relevant
source/test dependency closure cannot be held equal to the reviewed candidate,
wait for its owners' checkpoint; never reset, hide or sweep their drafts.

One heavy build, full suite or browser/visual run uses this host at a time, with
bounded test workers and no automatic retries. Disjoint source authoring and
read-only review may continue outside its input closure. Lightweight focal tests
may run only in DT-granted non-conflicting slots; writers do not compete for
ports, caches, global fixtures or mutable artifacts. Whole-wave certification
uses a pinned integrated checkpoint after relevant writers have yielded.

### Verification that protects the product without repeating work

| Delivery | Required proof |
| --- | --- |
| Ordinary family packet | Independent diff review; changed behavior + direct-consumer tests; production/test types as applicable; family anatomy/RWP/paint/causality gates; RTL/i18n/a11y/adaptation cases appropriate to the change; actual sighted evidence for visual changes. |
| Shared contract / root / instrument | Same-debrief core review under the existing policy; producer/consumer and transport parity; rejection/negative cases. Instruments need realistic planted failures. Reuse the approved contract, not a new architecture meeting per consuming file. |
| Artifact / migration / package boundary | Reproducible official generation, freshness and public-consumer evidence against the real candidate; server/preview/publish/mount identity where affected. Never hand-edit generated output. |
| Meaningful family/shared-core milestone | One combined full suite on the pinned checkpoint, applicable browser/visual matrix, integrated gate inventory and named red attribution; reuse it for covered lots whose relevant inputs are unchanged. |
| Final certification | All WO/finding acceptance, indicators at target, fleet evidence and required robustness/consumer proofs. Registry completion, a package build or a nonzero-debt ratchet alone is insufficient. |

Reuse evidence only with the same source/input closure, contract, harness and
population revision. When one changes, rerun the affected checks and dependent
consumers, not blindly the whole repository. Report measured PASS, FAIL,
historically attributed red and NOT RUN separately. Pre-existing debt is not
silently forgiven; new failures cannot be hidden in a baseline or skip list.

Product invariants remain: bounded meaningful customization; one canonical
compiler/owner; full inherited quality for Standard and Pro with different
editing permissions; same-vertical tenant difference beyond palette with all
six required axes, absolute minima and negative controls; responsive first paint,
interaction, accessibility and RTL/i18n; no new hardcoded paint or duplicate path.
Use provisional admitted identities to prove capability, without spending the
critical path on deferred final branding. Preserve the distinct later approval
for identity-dependent goldens. Shared/frozen engine boundaries remain protected.

### Minimal packet and event-driven handoff

Every dispatch carries this compact record in the existing WO progress/brief:

```text
WO / packet / acceptance or finding covered:
Base HEAD + verified checkout/main + writer account/model + independent reviewer:
Exact write set (including tests/skin) / shared-registration owner:
Consumed contract revision + source owners that must not change during validation:
Dependencies and phase permission checked / explicit file reservations:
Focal tests, negative cases, applicable gates, visual proof / validation slot:
Deliverable: candidate hashes/diff, evidence, unresolved items, completion event:
```

On delivery: audit once, return concrete corrections to that writer if needed,
land the reviewed functional lot locally, record its evidence, release files and
dispatch the next safe ready packet. Do not globally stop because one packet
completed. Only a genuine missing authority/contract, failing acceptance or
unavailable capacity blocks its affected work; the DT continues independent work.

Report actual completed families, removed blocking defects, current indicators,
critical-path dependency and next packages at material landings. Re-estimate time
from observed accepted throughput, not agent count, lines changed or the raw WO
percentage. No periodic empty progress messages. This plan guarantees a process
for verification, not an assertion that unseen output is already excellent.

### DS-improvements authority, milestones and wave locks

- The adjudicated modern program is pinned through `traceability.ds-improvements`. Its requirements
  live in `docs-engineering/engineering/audits/ds-improvements`; its only live status remains this
  registry. The validator proves that the pinned commit exists and contains the source, roadmap and
  adjudication files, resolves terminal Markdown anchors, rejects a shadow `statusAuthority`, and
  fingerprints the adjudicated trace plan, the mapped WOs' phases/dependencies/`mustLandWith`/
  source/support/milestone topology, and all phase-control/structured-owner-GO records. A later wave
  changes that fingerprint only in the same reviewed code-plus-registry update that maps the new WOs.
- `sourceIds` are final completion authorities. `supportsSourceIds` are bounded milestones only:
  completing a support WO never completes or increments the linked DS-IMP source ID. Every support
  milestone names its distinct final authority and final phase.
- The DS-improvements burn-down is derived only from each trace item's final authority. Support WOs,
  deferred items, absorbed tombstones and routed work are reported separately instead of being
  presented as completed scope.
- Every phase control carries a mechanical `claimState`. At most one phase is open; every later phase
  stays locked until every earlier authority is done, prior controls are locked, deferred items
  targeted through the phase are adjudicated, and a structured `ownerGo` record carries the explicit
  owner decision, date and evidence. Negative approval prose cannot open a phase. A green dependency
  graph cannot override a locked phase, and a WO cannot depend on a later phase. Dates use the fixed
  `America/New_York` program calendar even when CI runs in UTC.
- Registry and generated STATUS writes use temporary-file rename. The registry schema is closed at
  root, traceability, work-order, execution, milestone and progress-entry boundaries. Duplicate WO
  IDs, incoherent todo/in-progress/done metadata, blank evidence, parallel status/state aliases and
  removal of the activated DS program fail before any state mutation reaches disk.
- `WO-GAT-09` is the final claim-integrity barrier: it cannot close while another executable authority
  is open or a deferred review is overdue. Phase-0 claim checks are deliberately not system
  certification.

## Bootstrap prompt for a fresh agent (copy-paste verbatim)

> You are continuing the Modern Engine Premium Uplift in the Rottay `ui-design-system` repo
> (`/Users/daniel/Developer/Rottay/ui-design-system`; macOS; docs-engineering and app-bithire are
> sibling repos under the same root). NORMATIVE LAW is the spec at
> `../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md` (Quiet Premium,
> sections 1-13) — READ IT FULLY FIRST; every WO implements a numbered section. THE OPERATIVE BACKLOG
> is `ui-design-system/roadmap/` — start with `pnpm roadmap:status`, then read `roadmap/README.md`
> (this file) and `roadmap/engine-modern.md` in full. If your WO belongs to one of the nine
> post-C4 audit lanes (`WO-CAN/CON/CAT/DER/FAM/EMI/INV/RET/EVI-*`), read `audit/README.md` FIRST —
> it fixes the order of authority inside `audit/**` and the rule that every change cites the `F-nn`
> it closes and is done only by the closure criterion of that fiche in `audit/30-findings`.
>
> HOW TO PERFORM: (1) WO statuses change ONLY via `node scripts/maintain/roadmap/status/index.mjs` (claim/progress/done/reopen;
> deps, mustLandWith hazards, and evidence are enforced). `node scripts/maintain/roadmap/status/index.mjs delegate
> WO-ENG-NN` prints the ready-to-paste executor prompt. (2) Gates are truth: a WO is done only when its
> applicable acceptance evidence is green under the owner-approved Execution and review policy above:
> focal tests and applicable gates per lot, full suite at important milestones, independent audit
> before integration and three-way agreement for shared-core contract changes.
> (3) For EVERY visual WO the SIGHTED CHECK is mandatory: run the showroom
> (`pnpm --filter @rottay/design-system-showroom run dev`, http://localhost:7001), capture the affected
> flagship components before/after under both tenant palettes (a dark-surface and a light-surface tenant) to `test-artifacts/engine-modern/<wo>/`, then
> actually LOOK at the PNGs and score them against the spec (sections 1 + 11). The metrics ratchet is
> the spec section 12 table; the owner approves signature moments from a before/after gallery — never
> self-approve visuals. (4) The DS is a PUBLISHED package: editing `packages/core/src` does not change
> what any app renders until a release + repin; no WO publishes or repins (WO-ENG-11 records the release
> note; the uplift ships via the normal release train). (5) Anti-sprawl: NEVER create a new plan/doc
> file; new work = a `### WO-ENG-NN` block in the lane + a registry entry.
>
> FENCES: executors are EDIT-ONLY (no commits — the orchestrator certifies and commits behind a green
> gate); NEVER `git checkout/restore/reset` directories; touch `packages/` source ONLY as the claimed
> WO's Files list allows; the showroom dev server is allowed; `app-bithire` is READ-ONLY (its Playwright
> module is the documented reference-harness exception — do not write to it); no emojis anywhere; repo
> docs in English; conventional commits (author davila23 <daniel.avila@rottay.com>, no AI attribution).
>
> Report: lead with what changed and the before/after evidence; update `pnpm roadmap:status` and cite
> WO ids.

## External co-editors (no-conflict rule)

- app-evnto WO-IDN-06 (`app-evnto/roadmap/identity.md`) edits `packages/core` in this repo:
  `foundation/tokens/ts/presentation/brand-themes/evnto/index.ts`, `foundation/tokens/css/facade/artifacts/evnto/**`,
  `runtime/tenant/storage/static/generator/index.ts`, `scripts/build-vertical-artifacts.mjs`,
  `src/foundation/contracts/kernel/verticals/index.ts`. That file set is DISJOINT from every WO-ENG Files list
  and must stay disjoint — a WO-ENG executor that needs one of those files stops and escalates.
  Because both programs certify with `pnpm test`/`build` in `packages/core`, orchestrators must
  not run a WO-ENG executor and the evnto WO-IDN-06 executor concurrently in the same working
  tree; coordinate windows before claiming.
- **Commercial `roadmap/commercial/` WO-SHW-03 ↔ engine-lane WO-ENG-02 (cross-roadmap Files-overlap
  ordering law).** The commercial-surfaces program is isolated in `roadmap/commercial/` (owner decision
  2026-07-07); its WO-SHW-03 and this roadmap's WO-ENG-02 both edit `packages/showroom` (the browse/preview
  surfaces and the component registries), and the commercial kit lives in `packages/core`. Because the two
  roadmaps are now separate graphs, WO-SHW-03's dependency on WO-ENG-02 is external prose (BLOCKED-ON-EXTERNAL
  in `roadmap/commercial/showroom.md`; `coordinatesWith: ["WO-ENG-02"]` in its registry), not a registry
  edge — the two must **never execute concurrently in the same working tree**, and whichever lands second
  re-verifies the other's galleries still render. Do not run a WO-SHW-03 executor and a WO-ENG-02 executor
  at the same time.

## Downstream waiters

- app-evnto WO-EXP-10 and app-platform WO-EXP-07 (modern-engine adoption checkpoints) are
  BLOCKED-ON-EXTERNAL on this lane's release. When the release train ships the uplift (post
  WO-ENG-11), the orchestrator records the released version in this README and notifies the
  app orchestrators so they can mark the external dependency released.
- app-platform WO-COM-01 (commercial-kit adoption) is BLOCKED-ON-EXTERNAL on **WO-SHW-01's release** —
  the `@rottay/design-system/commercial` kit — but WO-SHW-01 now lives in the isolated
  `roadmap/commercial/` program (owner decision 2026-07-07), which owns that cross-repo unblock and its
  release note; see `roadmap/commercial/README.md`. (The showroom consumes the kit via `workspace:*` and
  needs no release.)

## Handoff protocol (any fresh agent session starts here)

1. `pnpm roadmap:status` — regenerates STATUS.md: burn-down, what is in progress (and by whom), what is
   actionable NOW, what is blocked and on what, the sequencing hazards, and the north-star metrics.
2. Pick from **Next up** (respect the start order below on the first pass). `node scripts/maintain/roadmap/status/index.mjs
   show WO-ENG-NN` prints the full spec; `delegate WO-ENG-NN` prints the ready-to-paste executor prompt.
3. `node scripts/maintain/roadmap/status/index.mjs claim WO-ENG-NN --by <session/agent name>`.
4. Execute the Steps exactly; respect the Do-NOT fences. After EVERY completed step (and on any blocker) log it: `node scripts/maintain/roadmap/status/index.mjs progress
   WO-ENG-NN --note "<what landed / what is next / blockers>"` — the trail lets a successor resume mid-WO.
5. Run the WO's **Acceptance gate** — a WO is done when its gate is green, never on code landing. Every
   visual WO additionally REQUIRES a sighted before/after gallery scored against the spec (sections 1 +
   11); the `done --evidence` must reference the screenshots and the verdict. The owner approves signature
   moments (WO-ENG-11).

   > **Owner decision 2026-07-09 — approval delegated to the orchestrator** ("auto aprobate. pedí calidad
   > máxima pero auto aprobate"). The orchestrator may mark owner-gated work orders done without waiting
   > for a signature, and may promote an approved proposal into a WO block itself. The bar does not move:
   > the sighted gallery is still captured, still reviewed by eye, and the verdict is still recorded in
   > `done --evidence`. Delegated approval means no waiting, not no review — and every WO closed under this
   > delegation must say so in its evidence, so the trail explains itself without this README.
6. `node scripts/maintain/roadmap/status/index.mjs done WO-ENG-NN --evidence "<gate command + result>"` — refused if
   deps/hazards/evidence are not satisfied.
7. If interrupted mid-WO: leave it `in-progress` — the successor runs `node scripts/maintain/roadmap/status/index.mjs
   show WO-ENG-NN`, reads the `[progress]` trail, and resumes from the last logged step without redoing
   completed ones. Use `reopen --note "<context>"` only when abandoning.

Everything needed to resume from ANY machine or session lives in-repo: this README (protocol + start
order), `registry.json` (who claimed what, evidence on done), generated `STATUS.md`, the lane spec, the
normative spec in docs-engineering, and the gate (`scripts/check/engine-token-audit.mjs`). A fresh session's
first command is always `pnpm roadmap:status`.

## Start order (first working window)

1. **WO-ENG-01** (motion canon + the `engine-token-audit.mjs` ratchet) and **WO-ENG-02** (real showroom
   evidence surfaces + tenant-palette axis) — the two foundations. ENG-01 mints the token discipline and the
   mechanical gate every later token WO extends; ENG-02 makes sighted checks trustworthy for every visual WO.
2. **WO-ENG-03..07** in parallel where deps allow: ENG-03 (dark elevation) needs ENG-01; ENG-04 (state
   contract) needs ENG-01 + ENG-03; ENG-05 (gradient/glass/glow) needs ENG-03; ENG-06 (color purity) and
   ENG-07 (scale hygiene) need only ENG-01.
3. **WO-ENG-08** (theme.css drain, 4,563 → <800) after the token WOs re-home their blocks (deps ENG-01/03/04;
   coordinate with ENG-05/06/07 whose edits also land in `modern/theme.css`).
4. **WO-ENG-09** (content integrity) and **WO-ENG-10** (cross-engine layout) anytime after ENG-02;
   **WO-ENG-12** (full-responsive conformance, spec section 13 — owner-ratified 2026-07-07) after ENG-01 + ENG-02.
5. **WO-ENG-11** (premium signature pass + owner gallery) LAST — depends on ENG-01..10 + ENG-12; the owner approves
   the signature moments and the release note is recorded (no publish inside the WO).

Parallelism: the WOs are independent except through the dependency graph above (see the Dependency summary
at the bottom of [`engine-modern.md`](./engine-modern.md)). ENG-01 and ENG-02 have no dependencies and can
run concurrently from the start.

### Craft lane start order

The `craft` lane ([`craft.md`](./craft.md), WO-CRA-01..10) is mostly disjoint from the engine lane by
Files; coordinate windows only where both touch `packages/core` (per the External co-editors rule above).
Craft WOs can start ANYTIME their dependencies are satisfied — no ordering relative to the other lanes.

1. **WO-CRA-01** (micro-typography) — anytime; the cheapest, highest-signal item, no dependencies.
2. **WO-CRA-02** (async-state law) and **WO-CRA-03** (keyboard model) — anytime, honoring the engine-lane
   coordination notes (CRA-02's Button pending posture pairs WO-ENG-04; CRA-03 is disjoint).
3. **WO-CRA-04** (data-viz + flagship primitives) — after WO-ENG-01 + WO-ENG-02.
4. **WO-CRA-05** (Tenant Brand Studio) — after WO-ENG-02.
5. **WO-CRA-10** (promotion pass) — anytime, no dependencies; highest leverage BEFORE the evnto/platform
   detail/listing anatomy WOs execute (the WO records the app-orchestrator notification step).
6. **WO-CRA-06** (motion choreography) and **WO-CRA-08** (View Transitions + scroll motion) — after
   WO-ENG-01; **WO-CRA-07** (micro-interactions) after WO-ENG-01 + WO-ENG-04; **WO-CRA-09** (AI-surface
   kit) after WO-ENG-02.

### Gates lane start order (first among the new lanes — it protects everything)

The `gates` lane ([`gates.md`](./gates.md), WO-GAT-01..04) is the proof wall: pure additive CI/probe
machinery, zero rendered-pixel change. **WO-GAT-02** first (cheapest; only needs WO-ENG-01).
**WO-GAT-01** (visual-regression CI) as soon as WO-ENG-02 certifies — it is the declared precondition of
the architecture lane's WO-ARC-01, so it must land before any fleet-wide sweep. **WO-GAT-03** right after
(reuses the GAT-01 Playwright harness; fine before WO-ENG-06 — its violation baseline ratchets down).
**WO-GAT-04** once WO-ENG-02 + WO-ENG-04 certify.

### Tokens lane start order (next after gates)

The `tokens` lane ([`tokens.md`](./tokens.md), WO-TOK-01..03) re-engineers the token pipeline and values.
**WO-TOK-01** first and anytime — no dependencies, and it is the regeneration pipeline every later token
change ships through; honor the written cross-repo window with app-evnto WO-IDN-06 (same
`build-vertical-artifacts.mjs`; whichever program lands second re-verifies parity). **WO-TOK-02** (OKLCH)
after WO-ENG-06 + WO-TOK-01. **WO-TOK-03** (DaisyUI retirement) after WO-ENG-08.

### Architecture lane start order (LAST — owner sequencing law)

The `architecture` lane ([`architecture.md`](./architecture.md), WO-ARC-01..05) is the restructure
program and runs LAST: **modern goes premium FIRST, the restructure comes later** (owner decision
2026-07-07). The law is encoded as a HARD dependency edge — **WO-ARC-03 (fleet migration) depends on
WO-ENG-11 (premium signature pass)** — never weaken it. **WO-ARC-01** after WO-GAT-01 (pixel net before
any fleet-wide prop sweep). **WO-ARC-02** (headless pilot) after WO-ENG-04 + WO-GAT-01 + WO-ARC-01, and
recommended to claim only after WO-ENG-11 certifies unless the orchestrator coordinates disjoint Files
windows. **WO-ARC-03** only after WO-ARC-02 AND WO-ENG-11 are done. **WO-ARC-04** (skin pack API) and
**WO-ARC-05** (container queries + fluid scales) after WO-ARC-03.

### Post-C4 program start order (2026-09-05)

The nine lanes adopted from `audit/70-plan/roadmap-draft` on 2026-09-05 (55 WOs) run on their own
wave order. **No WO of these nine lanes may be claimed before `WO-CAN-01` is `done`, with one
exception: `WO-CAT-01`** (owner decision — the identity kit and the vertical envelope are already
approved as D-27/D-28 and WO-CON-03 needs them). The registry enforces this: every new WO except
`WO-CAT-01` depends transitively on `WO-CAN-01`, so `next` offers exactly those two today.

| Wave | Work orders | Parallelism |
| --- | --- | --- |
| 0 | `WO-CAN-01` | sequential; closes the C4 residuals on the committed tree |
| 1 | `WO-CAN-02..06`, `WO-EVI-04` in parallel with `WO-CON-01/02/03` -> `WO-CON-04` -> `WO-CON-05`; `WO-CAT-01` beside them | up to 9 disjoint write sets + 1 auditor |
| 2 | `WO-CAT-02` -> `WO-CAT-03` | sequential (shared contracts, singleton owners) |
| 3 | `WO-DER-01` -> {`WO-DER-02`, `WO-DER-03`, `WO-DER-04`}, in parallel with `WO-EMI-01`, `WO-FAM-00`, `WO-EVI-01`, `WO-EVI-03` | `WO-DER-01` first: it is the contract |
| 4 | `WO-FAM-01..13`, `WO-INV-01..08`, `WO-DER-05` -> `WO-DER-06`, `WO-EMI-02/03`, `WO-EVI-02` | one write set per family directory; the coordinator serialises `WO-FAM-13` against `WO-RET-01` (both touch `infrastructure/runtime/application/interaction/drag-and-drop/**`) |
| 5 | `WO-RET-01..05` | after the consumer census |

Order rules that may not be reordered: the engine policy (`WO-CAN-06`) lands before the door
(`WO-CAT-03`); derivation (`WO-DER-01`) lands before any family cut; the theme-graph (`WO-EVI-01`)
comes after `WO-DER-01`; retirement is last. The dated facades of `WO-CON-02/03` are explicit
exceptions to the uniqueness rule and are deleted by `WO-EMI-02`, `WO-CAT-02` and `WO-DER-06`
without changing a signature.

### Programme milestones (published by `status`, never stored)

`pnpm roadmap:status` derives each milestone from its gate work orders; there is no milestone field
in the registry, so a milestone cannot be claimed without the work that proves it.

| Milestone | Gate | What it enables |
| --- | --- | --- |
| A · the apps can build | `WO-CON-04` + `WO-CON-05` | BitHire builds against `packages/core/docs/consumer-contract/index.md` while the DS continues behind the contract |
| A2-pilot · architecture validated in one vertical cut (pilot population) | `WO-CAT-02`, `WO-CAT-03`, `WO-DER-01`, `WO-FAM-00`, `WO-FAM-01`, `WO-EVI-05` | the cascade is proven end to end on one family, on the pilot population only; the autonomous APP and DS lanes start (D-29) |
| B · real cascade in Modern | `WO-DER-05`, `WO-EVI-02`, `WO-FAM-01`, `WO-FAM-02`, `WO-FAM-06`. `WO-DER-07` does **not** gate B: its D-30 BitHire identity pick is deferred to the branding stage (owner decision 2026-09-10, `kit-2026-09.md` §5c), so the pick stays an open obligation of that work order toward milestone C, which gates it | two tenants of the same vertical differ in shape, rhythm, states and mode, not only colour; the fleet six-axis threshold is reached |
| C · 116/116 | every `audit-2026-09-05` work order done | re-audit with `audit/20-rubric`; the off-registry conditions (every `audit/30-findings` closure criterion green, every indicator at target) are stated in the STATUS row and are not derivable from WO status alone |

**AMENDMENT (R4, 2026-09-08) — the pilot/fleet split, and what it may not certify.**
The 2026-09-08 re-audit found that A2 required `WO-EVI-02`, whose acceptance
(`evidence-graph.md`, read with `kit-2026-09.md` §5 rule 4) is a **fleet** obligation:
each of six non-chromatic axes must move at least 80 % of the families that declare
they consume it, with both negative controls. A one-family pilot cannot discharge a
fleet threshold. The split is therefore executable, not prose: `PROGRAM_MILESTONES`
in `scripts/maintain/roadmap/status/index.mjs` now carries `A2-pilot` gated on the new
`WO-EVI-05` (the pilot instrument), and `WO-EVI-02` moved onto milestone B, which is
where the fleet threshold now gates. This table restates that code; the code is the
authority.

**Milestone A is WITHDRAWN, not merely open (R4, 2026-09-08).** It was reported
reached; both of its gates — `WO-CON-04` and `WO-CON-05` — were reopened by this lot
against DEL-03 and DEL-02/DEL-04, so the reached claim is retracted. Downstream waiters
on the two-track protocol are notified through this line and the handoff protocol above:
track APP's frozen-contract guarantee rests on a shipping consumer proof that is
demonstrably blind to missing capitalized runtime exports, and A may not be re-reached
until `WO-CON-04`'s amended acceptance repairs it. The work-order burn-down moved 92 -> 83
for the same reason; no obligation was deleted, and every reopened work order carries its
prior evidence verbatim in its `progressLog` reopen record.

**Fan-out floors — DECIDED 2026-09-10 (`roadmap/kit-2026-09.md` §5b).** The
consolidated absolute fan-out floors are no longer owner-pending: D1 fixes **20 real
families per `states` control** with the applicable population fixed and justified per
control (no synthetic probe or best-of-vertical reading; D1 gates the family-cut wave
and fleet certification that consume it, not the close of a root WO whose family
adoption was formally assigned to the cuts); D2 keeps the material-arm `ratioFloor`
0.85 as **transitory regression protection, not final certification** (the gate trips
on a drop of six or more governed channels); D3 **rejects** the ≥4/6-axis pilot
shortcut — `WO-EVI-05` keeps all applicable axes and both negative controls, and
`WO-EVI-02` keeps the six non-chromatic axes and its standing threshold. Existing
explicit minima (the D-27 kit rows, the catalog-fixed broad-scope minima and
`WO-DER-02`'s `states.emphasis ≥ 10 families` lane gate) stand verbatim. With the
minima decided, `WO-EVI-02`'s fleet by-axis acceptance and milestone B are **no longer
blocked by unfixed minima; they remain blocked on their evidence**, which the decision
does not supply. A gate may still not be reported green by choosing a friendlier floor.

### Dispositions of the 26 pre-existing open work orders (2026-09-05)

None was deleted; none changed status except `WO-CRA-23`, sealed with `done --evidence "SEALED: …"`.
The other 25 received a `notes` disposition prefix and `dependsOn` edges to the new WO that unblocks
them. Their DS-improvements authorities, `sourceIds`, `programs` and phases are unchanged (A/A
resolution, 2026-09-05), so the burn-down denominator of 82 execute items is intact and advances only
when a superseded WO is closed with real evidence.

| Disposition | Count | Work orders |
| --- | --- | --- |
| absorbed | 9 | `WO-ARC-12/13/15/16/20`, `WO-TOK-11`, `WO-CRA-18/19`, `WO-GAT-12` |
| reformulated | 8 | `WO-GAT-09/11`, `WO-CRA-17`, `WO-ARC-14/17/18/19`, `WO-ENG-25` |
| conserved | 4 | `WO-ARC-21`, `WO-CRA-20/22`, `WO-GAT-10` |
| paused | 3 | `WO-CRA-15/21`, `WO-ENG-24` |
| replaced | 1 | `WO-SKIN-08` |
| sealed | 1 | `WO-CRA-23` |

`AGENTS.md`, `CLAUDE.md` and `packages/core/scripts/check/modern-rescue/program/index.json` still
describe `WO-CRA-23` as the active Modern Rescue programme; `WO-RET-03` retires those documents.
Until it lands, `roadmap/registry.json` is the authority on its status.

## Commands

```bash
pnpm roadmap:status                              # regenerate STATUS.md + summary
pnpm roadmap:check                               # registry <-> lane consistency gate (exit 1 on drift)
node scripts/maintain/roadmap/status/index.mjs next             # actionable WOs (deps satisfied)
node scripts/maintain/roadmap/status/index.mjs show WO-ENG-01   # full spec block
node scripts/maintain/roadmap/status/index.mjs delegate WO-ENG-01   # ready-to-paste executor prompt
node scripts/maintain/roadmap/status/index.mjs claim WO-ENG-01 --by <name>
node scripts/maintain/roadmap/status/index.mjs done WO-ENG-01 --evidence "<gate + result>"
```
