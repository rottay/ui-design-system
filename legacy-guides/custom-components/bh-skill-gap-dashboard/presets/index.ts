/**
 * BhSkillGapDashboard - All Presets
 */

import type { BhSkillGapDashboardPreset, BhSkillGapDashboardProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhSkillGapDashboard } from './dashboard';
import { CompactBhSkillGapDashboard } from './compact';

export { DashboardBhSkillGapDashboard } from './dashboard';
export { CompactBhSkillGapDashboard } from './compact';

export const BH_SKILL_GAP_DASHBOARD_PRESETS: Record<BhSkillGapDashboardPreset, ComponentType<BhSkillGapDashboardProps>> = {
  'dashboard': DashboardBhSkillGapDashboard,
  'compact': CompactBhSkillGapDashboard,
};
