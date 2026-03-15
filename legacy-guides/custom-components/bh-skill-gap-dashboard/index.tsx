/**
 * BhSkillGapDashboard - Main Export
 * Comprehensive skill gap analysis for BitHire ATS platform
 */

import type { BhSkillGapDashboardProps } from './core';
import { BH_SKILL_GAP_DASHBOARD_DEFAULTS } from './core';
import { BH_SKILL_GAP_DASHBOARD_PRESETS } from './presets';

export {
  type BhSkillGapDashboardProps,
  type BhSkillGapDashboardPreset,
  type SkillGapData,
  type SkillGapAnalysisSelect,
  BH_SKILL_GAP_DASHBOARD_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhSkillGapDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSkillGapDashboard(props: BhSkillGapDashboardProps): React.ReactElement {
  const preset = props.preset ?? BH_SKILL_GAP_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_SKILL_GAP_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSkillGapDashboard.displayName = 'BhSkillGapDashboard';

export { DashboardBhSkillGapDashboard, CompactBhSkillGapDashboard } from './presets';
