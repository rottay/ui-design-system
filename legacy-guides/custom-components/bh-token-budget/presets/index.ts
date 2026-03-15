/**
 * BhTokenBudget - All Presets
 */

import type { BhTokenBudgetPreset, BhTokenBudgetProps } from '../core';
import type { ComponentType } from 'react';
import { ConfigBhTokenBudget } from './config';
import { CompactBhTokenBudget } from './compact';

export { ConfigBhTokenBudget } from './config';
export { CompactBhTokenBudget } from './compact';

export const BH_TOKEN_BUDGET_PRESETS: Record<BhTokenBudgetPreset, ComponentType<BhTokenBudgetProps>> = {
  'config': ConfigBhTokenBudget,
  'compact': CompactBhTokenBudget,
};
