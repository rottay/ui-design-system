# Commercial Surfaces — Isolated Program (ui-design-system / showroom)

- **Status**: canonical, ISOLATED. This is THE standalone commercial-surfaces program for ui-design-system,
  extracted out of the main `roadmap/` by **owner decision 2026-07-07**. It has its own lane, its own
  registry, its own generated STATUS, and its own machinery (`pnpm roadmap:commercial`). It is NOT part of the
  main ui-design-system roadmap graph (engine-modern / craft / gates / tokens / architecture) and never shares
  state with it.
- **Scope**: relaunch `showroom.rottay.com` (`packages/showroom`) on the Monochrome Signature AND build the
  shared commercial kit (`@rottay/design-system/commercial`, in `packages/core`) that the showroom and the two
  app-platform surfaces all consume. Six work orders: **WO-SHW-01..06** (see [`showroom.md`](./showroom.md)).

## Normative law + evidence

- **Normative law (read FIRST)**: the Commercial Surfaces — Monochrome Signature Specification at
  `../../docs-engineering/engineering/design-system/commercial-surfaces/README.md` (sections 1-11; sections 1-9
  are the shared law, section 8 defines the commercial kit WO-SHW-01 builds, section 10.3 is the Showroom =
  the blueprint target, and section 11 the excellence layer — 11.0 shared baseline + 11.3 showroom advanced —
  the source for WO-SHW-06). Read it fully before any WO.
- **Evidence base (the two 2026-07-07 audits)**:
  - `../../docs-engineering/archive/audits/2026-07-07-showroom-commercial-audit-davila.md`
    (this program's measured evidence: commercial score 4/10, brand break at the first click, index pages with
    zero live components, runtime-readout redundancy + title triplication, buried vertical proof, motion/ASCII/
    texture gaps).
  - `../../docs-engineering/archive/audits/2026-07-07-platform-commercial-surfaces-audit-davila.md`
    (the sibling app-platform surfaces — cross-reference only).

## State model (this plan cannot rot silently)

- **The spec** lives in [`showroom.md`](./showroom.md) (the one lane file). **State** lives in
  [`registry.json`](./registry.json) — the ONLY place a WO status exists. **[`STATUS.md`](./STATUS.md) is
  generated** (`pnpm roadmap:commercial`); never hand-edit either.
- Statuses change ONLY through `scripts/roadmap-commercial-status.mjs`
  (`claim` / `progress` / `done` / `reopen`), which mechanically enforces the dependency graph and mandatory
  evidence on `done`. Do not fight refusals — they encode the sequencing law.
- **Progress mid-WO handoff law**: after every completed step (and on any blocker) log it via
  `progress WO-SHW-NN --note "<what landed / what is next / blockers>"`. If an agent dies mid-WO, the successor
  runs `show WO-SHW-NN`, reads the `[progress]` trail, and resumes from the last logged step instead of
  restarting.
- `pnpm roadmap:commercial:check` (registry ↔ lane file must agree: every WO heading registered, titles/lanes/
  deps valid, no cycles, no done-without-evidence) is the consistency gate — run it before handing off.
- Anti-sprawl: new work = a new `### WO-SHW-NN` block in `showroom.md` + a `registry.json` entry
  (`roadmap:commercial:check` forces the pairing). **No new plan documents.**

## Bootstrap prompt for a fresh agent (copy-paste verbatim)

> You are executing the ISOLATED commercial-surfaces program for ui-design-system in the Rottay monorepo
> (`/Users/daniel/Developer/Rottay/ui-design-system`; macOS; docs-engineering and app-bithire are sibling
> repos under the same root). READ the SPEC FIRST:
> `../../docs-engineering/engineering/design-system/commercial-surfaces/README.md` (sections 1-10, especially
> section 8 the kit + 10.3 the blueprint). Then read the lane [`roadmap-commercial/showroom.md`](./showroom.md)
> and this README in full. This program is SEPARATE from the main `roadmap/` — use ONLY the commercial
> machinery below.
>
> HOW TO PERFORM: (1) WO statuses change ONLY via `node scripts/roadmap-commercial-status.mjs`
> (claim/progress/done/reopen; `delegate WO-SHW-NN` prints the ready-to-paste executor prompt; deps + evidence
> are enforced). Log step-level progress after every completed step so a cut-off session's successor resumes
> mid-WO from `show`. (2) Gates are truth: a WO is done only when its acceptance gate is green
> (`pnpm --filter @rottay/design-system run build` + `pnpm test` for kit work in `packages/core`;
> `pnpm --filter @rottay/showroom run typecheck` + `run build` for showroom work). Every visual WO REQUIRES a
> sighted before/after gallery under BOTH tenant palettes (a dark-surface tenant + a light-surface tenant) at
> 1280 + 360 to `test-artifacts/showroom/<wo>/`; owner approves signature moments (WO-SHW-02/04/05). Playwright
> is not installed here — drive captures from app-bithire's bundled Playwright (documented reference-harness
> exception; app-bithire stays READ-ONLY). (3) The DS is a published package: editing `packages/core/src` does
> not change what any app renders until a release + repin; no WO publishes or repins. WO-SHW-01's RELEASE is
> the cross-repo unblock for app-platform WO-COM-01. (4) Monochrome is absolute in the chrome; color lives only
> inside framed `ProductWindow`s. No emojis — the ASCII vocabulary IS the icon language. (5) Anti-sprawl: new
> work = a `### WO-SHW-NN` block in `showroom.md` + a registry entry; NO new plan documents.
>
> FENCES: executors are EDIT-ONLY (the orchestrator certifies and commits behind a green gate — author
> davila23, conventional commits, no AI attribution); NEVER `git checkout/restore/reset` on directories; touch
> `packages/` source ONLY as the claimed WO's Files list allows; the showroom dev server is allowed;
> `app-bithire`, `app-platform`, and `docs-engineering` are READ-ONLY references; do not edit the main
> `roadmap/`; no emojis; English.
>
> Report: lead with what changed and the before/after evidence; run `pnpm roadmap:commercial` and cite WO ids.

## Cross-repo map

- **Sibling program**: `app-platform/roadmap-commercial/` (the commercial lane, WO-COM-01..04) is the other
  half of this program — same normative spec, same Monochrome Signature law, separate release train.
- **SHW-01 → COM-01 unblock**: **WO-SHW-01's RELEASE** (the `@rottay/design-system/commercial` kit) is the
  cross-repo unblock for app-platform WO-COM-01 (BLOCKED-ON-EXTERNAL). When the release train ships the kit,
  the orchestrator records the released version here and notifies the app-platform orchestrator so it can mark
  its external dependency released. The showroom consumes the kit via `workspace:*` (hot-reload) and needs no
  release.
- **ENG-02 external ordering law**: **WO-SHW-03** takes a cross-roadmap BLOCKED-ON-EXTERNAL ordering law on
  **WO-ENG-02 in the MAIN ui-design-system roadmap** (`roadmap/engine-modern.md`). Both edit `packages/showroom`
  (browse/preview surfaces + component registries). Because the two roadmaps are now separate graphs, this is
  external prose (the registry `dependsOn` is `["WO-SHW-01"]`; `coordinatesWith: ["WO-ENG-02"]` records it), not
  a registry edge. **Never run the WO-SHW-03 and WO-ENG-02 executors concurrently in the same working tree;
  whichever lands second re-verifies the other's galleries still render.**

## Start order

1. **WO-SHW-01** (the commercial kit at `@rottay/design-system/commercial`) FIRST — it mints the shared
   monochrome vocabulary every later WO renders with, and its RELEASE is the app-platform cross-repo unblock.
   No dependencies; start immediately.
2. **WO-SHW-02** (monochrome chrome — one brand from the front door inward) after WO-SHW-01.
3. **WO-SHW-03** (index pages become galleries) after WO-SHW-01, honoring the WO-ENG-02 external ordering law
   above (never concurrent; whichever lands second re-verifies).
4. **WO-SHW-04** (blueprint sheets + the three lenses) after WO-SHW-02 + WO-SHW-03; **WO-SHW-05** (the tour,
   the promotion, the doors) after WO-SHW-03 + WO-SHW-04.
5. **WO-SHW-06** (showroom excellence pass, spec 11.3 + 11.0) **LAST** — after WO-SHW-04 + WO-SHW-05; the
   second pass over the whole relaunched showroom. It edits `packages/showroom` broadly, so honor the WO-ENG-02
   external ordering law (never concurrent; re-verify galleries). The excellence layer is spec section 11.

## Commands

```bash
pnpm roadmap:commercial                                       # regenerate STATUS.md + summary
pnpm roadmap:commercial:check                                 # registry <-> lane consistency gate (exit 1 on drift)
node scripts/roadmap-commercial-status.mjs next               # actionable WOs (deps satisfied)
node scripts/roadmap-commercial-status.mjs show WO-SHW-01     # full spec block
node scripts/roadmap-commercial-status.mjs delegate WO-SHW-01 # ready-to-paste executor prompt
node scripts/roadmap-commercial-status.mjs claim WO-SHW-01 --by <name>
node scripts/roadmap-commercial-status.mjs done WO-SHW-01 --evidence "<gate + result>"
```
