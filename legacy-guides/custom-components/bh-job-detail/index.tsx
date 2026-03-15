/**
 * BhJobDetail - Main Export
 * Job Detail Page for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhJobDetailProps } from './core';
import { BH_JOB_DETAIL_DEFAULTS } from './core';
import { BH_JOB_DETAIL_PRESETS } from './presets';

export {
  type BhJobDetailProps,
  type BhJobDetailPreset,
  type JobInfo,
  type JobMetric,
  type FunnelStage,
  type CandidatePreview,
  type TemplateInfo,
  type JobEvent,
  type AnalyticsData,
  type AnalyticsSource,
  type TimeToStageEntry,
  type ScoreDistributionBucket,
  type JobSettings,
  type SlaConfig,
  type JobStatus,
  type UrgencyLevel,
  type CandidateStatus,
  type JobEventType,
  type MetricsTimeRange,
  type JobDetailTab,
  BH_JOB_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhJobDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhJobDetail(props: BhJobDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_JOB_DETAIL_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_JOB_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhJobDetail.displayName = 'BhJobDetail';

export { FullBhJobDetail, CompactBhJobDetail } from './presets';
