/**
 * DS Governance ESLint Plugin
 *
 * Entry point for `@rottay/design-system/eslint`.
 * Provides lint rules that enforce Design System conventions.
 *
 * `plugin/` owns the six code-convention rules. This entrypoint is the
 * published composition: it adds the consumer-contract rule, whose table is
 * owned by `docs/consumer-contract/index.md` rather than by a convention.
 *
 * This module is Node-only (no React, no "use client").
 */
import {
  configs as conventionConfigs,
  rules as conventionRules,
} from './plugin';
import { noUnsanctionedDsSubpath } from './rules/no-unsanctioned-ds-subpath';

export const rules = {
  ...conventionRules,
  'no-unsanctioned-ds-subpath': noUnsanctionedDsSubpath,
};

/** Standalone plugin reference (for manual wiring) */
export const plugin = { rules };

const CONTRACT_RULE = {
  '@rottay/no-unsanctioned-ds-subpath': 'error' as const,
};

export const configs = {
  /** All governance rules plus the consumer contract. */
  recommended: {
    plugins: { '@rottay': { rules } },
    rules: { ...conventionConfigs.recommended.rules, ...CONTRACT_RULE },
  },

  /** Marketing/landing pages: freeform HTML and colors, same import surface. */
  marketing: {
    plugins: { '@rottay': { rules } },
    rules: { ...conventionConfigs.marketing.rules, ...CONTRACT_RULE },
  },
};

export {
  CONTRACT_DOCUMENT_PATH,
  CONTRACT_PACKAGE,
  PUBLISHED_SUBPATHS,
  UNPUBLISHED_SUBPATHS,
  classifySubpath,
} from './rules/no-unsanctioned-ds-subpath/contract';
export type {
  ContractRow,
  SubpathDisposition,
} from './rules/no-unsanctioned-ds-subpath/contract';
export type {
  Rule,
  RuleMeta,
  RuleContext,
  ReportDescriptor,
} from './contracts';
