/**
 * PlFeatureRules - All Presets
 */

export { BuilderPlFeatureRules } from './builder';
export { TablePlFeatureRules } from './table';

import type { PlFeatureRulesPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlFeatureRulesProps } from '../core';
import { BuilderPlFeatureRules } from './builder';
import { TablePlFeatureRules } from './table';

export const PL_FEATURE_RULES_PRESETS: Record<PlFeatureRulesPreset, ComponentType<PlFeatureRulesProps>> = {
  builder: BuilderPlFeatureRules,
  table: TablePlFeatureRules,
};
