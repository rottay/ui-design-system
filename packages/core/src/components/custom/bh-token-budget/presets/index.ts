/**
 * BhTokenBudget - All Presets
 */

import type { BhTokenBudgetPreset } from '../core';
import { ConfigBhTokenBudget } from './config';
import { CompactBhTokenBudget } from './compact';

export { ConfigBhTokenBudget } from './config';
export { CompactBhTokenBudget } from './compact';

export const BH_TOKEN_BUDGET_PRESETS: Record<BhTokenBudgetPreset, React.ComponentType<any>> = {
  'config': ConfigBhTokenBudget,
  'compact': CompactBhTokenBudget,
};
