/**
 * BhSkillGapDashboard - All Presets
 */

import type { BhSkillGapDashboardPreset } from '../core';
import { DashboardBhSkillGapDashboard } from './dashboard';
import { CompactBhSkillGapDashboard } from './compact';

export { DashboardBhSkillGapDashboard } from './dashboard';
export { CompactBhSkillGapDashboard } from './compact';

export const BH_SKILL_GAP_DASHBOARD_PRESETS: Record<BhSkillGapDashboardPreset, React.ComponentType<any>> = {
  'dashboard': DashboardBhSkillGapDashboard,
  'compact': CompactBhSkillGapDashboard,
};
