/**
 * @fileoverview Test Helpers Index
 * @description Central export point for all test utilities
 *
 * The tenant and tenant-CSS helpers this barrel used to re-export were removed
 * with `tests/system/theming` (WO-CAN-02, audit F-23/F-104): they handed out
 * `TenantConfig`s for two customers that do not exist (`acme`, `northwind`),
 * wrote a stylesheet from the same literals the assertions then read back, and
 * had no consumer other than that one suite. Engine suites use
 * `renderWithEngine` below, whose fixture carries identity and no paint.
 */

// Engine test utilities
export {
  STABLE_ENGINES,
  type StableEngineName,
  type RenderWithEngineOptions,
  type MultiEngineRenderResult,
  renderWithEngine,
  renderWithAllEngines,
  describeEachEngine,
  itEachEngine,
  assertAcrossEngines,
  isStableEngine,
  getEngineDisplayName,
} from './engine';
