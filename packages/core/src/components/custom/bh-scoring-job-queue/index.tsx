/**
 * BhScoringJobQueue - Main Export
 * Scoring job queue management for the BitHire ATS platform
 */

import type { BhScoringJobQueueProps } from './core';
import { BH_SCORING_JOB_QUEUE_DEFAULTS } from './core';
import { BH_SCORING_JOB_QUEUE_PRESETS } from './presets';

export {
  type BhScoringJobQueueProps,
  type BhScoringJobQueuePreset,
  type ScoringJobView,
  type ScoringJobSelect,
  type ScoringJobStatus,
  type ScoringJobPriority,
  type QueueStats,
  BH_SCORING_JOB_QUEUE_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhScoringJobQueue component
 * Renders the appropriate preset based on the preset prop
 */
export function BhScoringJobQueue(props: BhScoringJobQueueProps): React.ReactElement {
  const preset = props.preset ?? BH_SCORING_JOB_QUEUE_DEFAULTS.preset ?? 'list';
  const PresetComponent = BH_SCORING_JOB_QUEUE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhScoringJobQueue.displayName = 'BhScoringJobQueue';

export { ListBhScoringJobQueue, CompactBhScoringJobQueue } from './presets';
