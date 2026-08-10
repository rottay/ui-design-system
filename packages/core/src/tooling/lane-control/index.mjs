/**
 * @fileoverview lane-control — the coordinator machinery.
 *
 * The programme runs many writer agents in parallel over one shared tree.
 * The field that is supposed to bound each of them, `writeRoot`, lived in a
 * single JSON document and in no executable anywhere in the repository:
 * "provably disjoint lanes" was prose. These four commands make it a
 * mechanism.
 *
 *   write-set-intersection  before the work — can these lanes collide?
 *   containment             after the work  — did this lane stay inside?
 *   work-order              the delegable unit, validated rather than trusted
 *   program-state           §4 as a command output, never a hand edit
 *
 * EVERYTHING HERE RUNS WITHOUT A BUILD. No `dist` import, no dependency the
 * repository has not already paid for, no install step. That is not a style
 * preference: the build has been red for this programme's whole life, and a
 * check nobody can run while the build is red is not a check.
 *
 * EVERY CHECK SHIPS A DRILL that shows it FAILING on an injected violation,
 * and a positive control that shows it passing on clean input. A check never
 * seen to fail proves nothing, and a check rigged to always fail proves less.
 *
 * This module re-exports the library surface so a caller has one import site.
 * The commands are the `.mjs` entrypoints in each sibling folder; see
 * `README.md` for the exact invocations.
 */
export * from './foundation/glob/index.mjs';
export * from './foundation/git/index.mjs';
export * from './runtime/ledger/index.mjs';
export * from './composition/plan/index.mjs';
export * from './foundation/report/index.mjs';
export * from './runtime/shared-files/index.mjs';
export { checkPlan } from './public/write-set-intersection/index.mjs';
export { checkContainment } from './public/containment/index.mjs';
export { validateWorkOrder, validateShape, MANDATORY_SENTENCE } from './public/work-order/index.mjs';
export { derive, renderBody, auditIntentForTypedFigures, collectRenderedStrings } from './public/program-state/index.mjs';
