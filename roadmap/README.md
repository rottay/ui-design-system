# Design System Roadmap — Modern Engine Premium Uplift

- **Status**: canonical operative backlog. Takes the `modern` engine from its audited state
  ("hand-made, mid-tier; near-indistinguishable from `rustic`") to the Quiet Premium target.
- **Normative law** (read FIRST, it is the spec every WO implements): the modern-engine
  specification at
  [`../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md`](../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md).
  Its evidence base is the visual audit at
  [`../../docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md`](../../docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md).
- **The work** lives in FIVE lanes — 34 WOs total (full-program conversion approved by the owner
  2026-07-07):
  - [`engine-modern.md`](./engine-modern.md) (12 WOs — the modern-engine premium uplift)
  - [`craft.md`](./craft.md) (10 WOs — DS interaction, craft, motion, AI surfaces, brand tooling)
  - [`gates.md`](./gates.md) (4 WOs — visual-regression, package-quality, whitelabel, and a11y proof)
  - [`tokens.md`](./tokens.md) (3 WOs — generated artifacts, OKLCH color engine, DaisyUI retirement)
  - [`architecture.md`](./architecture.md) (5 WOs — headless core restructure; runs LAST per the
    owner sequencing law)

  > The commercial-surfaces program (the showroom Monochrome Signature relaunch of `showroom.rottay.com`
  > + the shared `@rottay/design-system/commercial` kit, WO-SHW-01..05) lives in `roadmap-commercial/` —
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
   `APCA_BODY_TEXT_MIN_LC` from `dist/_internal/...`. The constant is exported in
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
   records 132 computed cells across tenant × engine × variant × state, and it found
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

- **The spec** lives in the lane files (`engine-modern.md`, `craft.md`, `gates.md`, `tokens.md`,
  `architecture.md`, `showroom.md`). **State** lives
  in [`registry.json`](./registry.json) — the ONLY place a WO status exists. **[`STATUS.md`](./STATUS.md)
  is generated** (`pnpm roadmap:status`); never hand-edit either.
- Statuses change ONLY through `scripts/roadmap-status.mjs` (`claim` / `progress` / `done` / `reopen`), which
  mechanically enforces the dependency graph, the `mustLandWith` sequencing hazards, and mandatory
  evidence on `done`. Do not fight refusals — they encode the sequencing law.
- `pnpm roadmap:check` (registry and lane file must agree: every WO heading registered, titles/lanes/
  deps valid, no cycles, no done-without-evidence) is the consistency gate. Run it before handing off.
- Anti-sprawl law: new work = a new `### WO-` block in its lane file + a registry entry
  (`roadmap:check` forces the pairing). **No new plan documents** — not here, not in docs-engineering.
  If a doc is not the lane, the registry, generated STATUS, or the spec, it does not exist. The ONE
  sanctioned exception is [`proposals.md`](./proposals.md) — the owner-review inbox (owner request
  2026-07-07): items there are NOT work until the owner approves them 1:1 and they become WO blocks.

## Bootstrap prompt for a fresh agent (copy-paste verbatim)

> You are continuing the Modern Engine Premium Uplift in the Rottay `ui-design-system` repo
> (`/Users/daniel/Developer/Rottay/ui-design-system`; macOS; docs-engineering and app-bithire are
> sibling repos under the same root). NORMATIVE LAW is the spec at
> `../../docs-engineering/engineering/design-system/runtime/engines/modern/README.md` (Quiet Premium,
> sections 1-13) — READ IT FULLY FIRST; every WO implements a numbered section. THE OPERATIVE BACKLOG
> is `ui-design-system/roadmap/` — start with `pnpm roadmap:status`, then read `roadmap/README.md`
> (this file) and `roadmap/engine-modern.md` in full.
>
> HOW TO PERFORM: (1) WO statuses change ONLY via `node scripts/roadmap-status.mjs` (claim/progress/done/reopen;
> deps, mustLandWith hazards, and evidence are enforced). `node scripts/roadmap-status.mjs delegate
> WO-ENG-NN` prints the ready-to-paste executor prompt. (2) Gates are truth: a WO is done only when its
> acceptance gate is green — the lane's mechanical gate is `node scripts/engine-token-audit.mjs --check`
> (created by WO-ENG-01, extended by every later token WO) plus `pnpm --filter @rottay/design-system run
> build` and `pnpm test`. (3) For EVERY visual WO the SIGHTED CHECK is mandatory: run the showroom
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
  `tokens/ts/brand-themes/evnto.ts`, `tokens/css/artifacts/evnto/**`,
  `runtime/tenant/storage/static/generator/index.ts`, `scripts/build-vertical-artifacts.mjs`,
  `src/contracts/verticals/index.ts`. That file set is DISJOINT from every WO-ENG Files list
  and must stay disjoint — a WO-ENG executor that needs one of those files stops and escalates.
  Because both programs certify with `pnpm test`/`build` in `packages/core`, orchestrators must
  not run a WO-ENG executor and the evnto WO-IDN-06 executor concurrently in the same working
  tree; coordinate windows before claiming.
- **Commercial `roadmap-commercial/` WO-SHW-03 ↔ engine-lane WO-ENG-02 (cross-roadmap Files-overlap
  ordering law).** The commercial-surfaces program is isolated in `roadmap-commercial/` (owner decision
  2026-07-07); its WO-SHW-03 and this roadmap's WO-ENG-02 both edit `packages/showroom` (the browse/preview
  surfaces and the component registries), and the commercial kit lives in `packages/core`. Because the two
  roadmaps are now separate graphs, WO-SHW-03's dependency on WO-ENG-02 is external prose (BLOCKED-ON-EXTERNAL
  in `roadmap-commercial/showroom.md`; `coordinatesWith: ["WO-ENG-02"]` in its registry), not a registry
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
  `roadmap-commercial/` program (owner decision 2026-07-07), which owns that cross-repo unblock and its
  release note; see `roadmap-commercial/README.md`. (The showroom consumes the kit via `workspace:*` and
  needs no release.)

## Handoff protocol (any fresh agent session starts here)

1. `pnpm roadmap:status` — regenerates STATUS.md: burn-down, what is in progress (and by whom), what is
   actionable NOW, what is blocked and on what, the sequencing hazards, and the north-star metrics.
2. Pick from **Next up** (respect the start order below on the first pass). `node scripts/roadmap-status.mjs
   show WO-ENG-NN` prints the full spec; `delegate WO-ENG-NN` prints the ready-to-paste executor prompt.
3. `node scripts/roadmap-status.mjs claim WO-ENG-NN --by <session/agent name>`.
4. Execute the Steps exactly; respect the Do-NOT fences. After EVERY completed step (and on any blocker) log it: `node scripts/roadmap-status.mjs progress
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
6. `node scripts/roadmap-status.mjs done WO-ENG-NN --evidence "<gate command + result>"` — refused if
   deps/hazards/evidence are not satisfied.
7. If interrupted mid-WO: leave it `in-progress` — the successor runs `node scripts/roadmap-status.mjs
   show WO-ENG-NN`, reads the `[progress]` trail, and resumes from the last logged step without redoing
   completed ones. Use `reopen --note "<context>"` only when abandoning.

Everything needed to resume from ANY machine or session lives in-repo: this README (protocol + start
order), `registry.json` (who claimed what, evidence on done), generated `STATUS.md`, the lane spec, the
normative spec in docs-engineering, and the gate (`scripts/engine-token-audit.mjs`). A fresh session's
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

## Commands

```bash
pnpm roadmap:status                              # regenerate STATUS.md + summary
pnpm roadmap:check                               # registry <-> lane consistency gate (exit 1 on drift)
node scripts/roadmap-status.mjs next             # actionable WOs (deps satisfied)
node scripts/roadmap-status.mjs show WO-ENG-01   # full spec block
node scripts/roadmap-status.mjs delegate WO-ENG-01   # ready-to-paste executor prompt
node scripts/roadmap-status.mjs claim WO-ENG-01 --by <name>
node scripts/roadmap-status.mjs done WO-ENG-01 --evidence "<gate + result>"
```
