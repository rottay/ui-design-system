/**
 * BhRecruiterHome - Main Export
 * Recruiter Main Dashboard for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhRecruiterHomeProps } from './core';
import { BH_RECRUITER_HOME_DEFAULTS } from './core';
import { BH_RECRUITER_HOME_PRESETS } from './presets';

export {
  type BhRecruiterHomeProps,
  type BhRecruiterHomePreset,
  type KpiStat,
  type PipelineJob,
  type PipelineStage,
  type UpcomingInterview,
  type QuickAction,
  type ActivityItem,
  type ActivityType,
  type EntityType,
  type Notification,
  type NotificationType,
  type AISuggestion,
  type PerformanceMetric,
  BH_RECRUITER_HOME_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhRecruiterHome component
 * Renders the appropriate preset based on the preset prop
 */
export function BhRecruiterHome(props: BhRecruiterHomeProps): React.ReactElement {
  const preset = props.preset ?? BH_RECRUITER_HOME_DEFAULTS.preset ?? 'overview';
  const PresetComponent = BH_RECRUITER_HOME_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRecruiterHome.displayName = 'BhRecruiterHome';

export { OverviewBhRecruiterHome, CompactBhRecruiterHome } from './presets';
