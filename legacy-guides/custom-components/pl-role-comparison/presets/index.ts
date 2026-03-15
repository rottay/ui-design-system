/**
 * PlRoleComparison - All Presets
 */

export { ComparisonPlRoleComparison } from './comparison';
export { DiffPlRoleComparison } from './diff';

import type { PlRoleComparisonPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlRoleComparisonProps } from '../core';
import { ComparisonPlRoleComparison } from './comparison';
import { DiffPlRoleComparison } from './diff';

export const PL_ROLE_COMPARISON_PRESETS: Record<PlRoleComparisonPreset, ComponentType<PlRoleComparisonProps>> = {
  comparison: ComparisonPlRoleComparison,
  diff: DiffPlRoleComparison,
};
