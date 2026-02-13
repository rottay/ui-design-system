/**
 * BhTokenBudget - Main Export
 * Budget configuration and alert thresholds for BitHire ATS platform
 */

import type { BhTokenBudgetProps } from './core';
import { BH_TOKEN_BUDGET_DEFAULTS } from './core';
import { BH_TOKEN_BUDGET_PRESETS } from './presets';

export {
  type BhTokenBudgetProps,
  type BhTokenBudgetPreset,
  type BudgetAllocation,
  BH_TOKEN_BUDGET_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhTokenBudget component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTokenBudget(props: BhTokenBudgetProps): React.ReactElement {
  const preset = props.preset ?? BH_TOKEN_BUDGET_DEFAULTS.preset ?? 'config';
  const PresetComponent = BH_TOKEN_BUDGET_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTokenBudget.displayName = 'BhTokenBudget';

export { ConfigBhTokenBudget, CompactBhTokenBudget } from './presets';
