/**
 * @fileoverview The per-family adaptation contracts that are still aggregated.
 *
 * REACH LAW. Every public entrypoint that reaches the adaptation kernel reaches
 * this barrel, so anything re-exported here is added to the reachable fan-out
 * and source bytes of subpaths that have nothing to do with it -- per adopted
 * family, which ratchets the budgets up forever. Two consequences:
 *
 *   - A family's own shape is NOT aggregated. A consumer takes `Adapt` from the
 *     kernel and the family's shape from `composition/families/<family>`, the
 *     pattern `overlay` (WO-FAM-04) set and `edit-fields` / `form-surface`
 *     (WO-FAM-10) follow. `data-table` and `form` predate it and are still
 *     below; migrating their consumers is owed to those families.
 *   - `registry` is NOT aggregated. No runtime module imports it: the
 *     `adapt-slot` gate reads `LAYOUT_SENSITIVE_FAMILIES` from the source with
 *     the TypeScript AST, so re-exporting it charged every entrypoint for a
 *     roster with no consumer -- and charged them again for every row a new
 *     adoption added. Import it from `composition/families/registry`.
 *
 * @module Contracts/Kernel/Adaptation/Families
 * @category Types
 * @package @rottay/design-system
 */

export * from './data-table';
export * from './form';
