/**
 * DS Governance ESLint Plugin
 *
 * Entry point for `@rottay/design-system/eslint`.
 * Provides lint rules that enforce Design System conventions.
 *
 * This module is Node-only (no React, no "use client").
 */
export { rules, plugin, configs } from '../../tooling/eslint';
export type {
  Rule,
  RuleMeta,
  RuleContext,
  ReportDescriptor,
} from '../../tooling/eslint';
