/**
 * PmPlanSelector - All Presets
 */

export { CardsPmPlanSelector } from './cards';
export { ComparisonPmPlanSelector } from './comparison';

import type { PmPlanSelectorPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPlanSelectorProps } from '../core';
import { CardsPmPlanSelector } from './cards';
import { ComparisonPmPlanSelector } from './comparison';

export const PM_PLAN_SELECTOR_PRESETS: Record<PmPlanSelectorPreset, ComponentType<PmPlanSelectorProps>> = {
  cards: CardsPmPlanSelector,
  comparison: ComparisonPmPlanSelector,
};
