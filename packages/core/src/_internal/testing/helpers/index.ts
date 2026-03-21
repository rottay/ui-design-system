/**
 * @fileoverview Test Helpers Index
 * @description Central export point for all test utilities
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
} from './engine-test-utils';

// Tenant test utilities
export {
  TEST_TENANTS,
  TENANT_CONFIGS,
  type TestTenantName,
  type RenderWithTenantOptions,
  type MultiTenantRenderResult,
  renderWithTenant,
  renderWithAllTenants,
  setTenantAttribute,
  clearTenantAttribute,
  describeEachTenant,
  itEachTenant,
  describeEachEngineAndTenant,
  assertAcrossTenants,
  assertAcrossEnginesAndTenants,
  getTenantConfig,
  isTestTenant,
} from './tenant-test-utils';

// CSS test utilities
export {
  getCSSVariable,
  getRootCSSVariable,
  hasCSSVariable,
  getCSSVariables,
  getComputedStyleProperty,
  expectCSSVariable,
  injectCSS,
  clearInjectedStyles,
  TENANT_CSS_EXPECTATIONS,
  ENGINE_CLASS_PREFIXES,
  hasEngineClasses,
  getEngineClasses,
  waitForStyles,
  getStyleSnapshot,
  compareStyleSnapshots,
  createTenantCSSFixture,
  loadTenantCSSFixtures,
} from './css-test-utils';
