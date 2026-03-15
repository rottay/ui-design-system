/**
 * BhScoringJobQueue - Core Interface
 * Scoring job queue management for the BitHire ATS platform
 *
 * Uses ScoringJobSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ScoringJobSelect } from '@rottay/scoring';

export type BhScoringJobQueuePreset = 'list' | 'compact';

/** DB-aligned status values from ScoringJobSelect.status */
export type ScoringJobStatus = ScoringJobSelect['status'];

/** UI priority derived from ScoringJobSelect.priority (integer) */
export type ScoringJobPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Extended job view combining DB entity with UI display fields */
export interface ScoringJobView {
  /** The DB entity (all fields optional for safety) */
  job?: Partial<ScoringJobSelect>;
  /** Display name of candidate (resolved from scorable) */
  candidateName?: string;
  /** Display name of position (resolved from scorable) */
  jobTitle?: string;
  /** Display name of rubric (resolved from rubric) */
  rubricName?: string;
  /** Progress 0-1 (UI-computed) */
  progress?: number;
  /** UI priority label (mapped from numeric priority) */
  priorityLabel?: ScoringJobPriority;
  /** Estimated duration in ms (UI-computed) */
  estimatedDuration?: number;
  /** Numeric priority value (from DB) */
  priority?: number;
  /** Number of retry attempts */
  retryCount?: number;
  /** Maximum retry attempts allowed */
  maxRetries?: number;
  /** Error code (machine-readable) */
  errorCode?: string;
  /** Stack trace or detailed error */
  errorDetails?: string;
  /** Time spent waiting in queue (ms) */
  queueWaitMs?: number;
  /** Time spent processing (ms) */
  processingTimeMs?: number;
  /** Scheduled start time */
  scheduledAt?: Date | string;
  /** Actual start time */
  startedAt?: Date | string;
  /** Completion time */
  completedAt?: Date | string;
  /** LLM model used for scoring */
  llmModel?: string;
  /** Tokens consumed by this job */
  tokensUsed?: number;
  /** Number of dimensions scored */
  dimensionsScored?: number;
  /** Total dimensions to score */
  totalDimensions?: number;
}

export interface QueueStats {
  totalJobs: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
  avgQueueWaitTime?: number;
  p95ProcessingTime?: number;
  throughputPerHour?: number;
  errorRate?: number;
  retryRate?: number;
  totalTokensUsed?: number;
}

export interface BhScoringJobQueueProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhScoringJobQueuePreset;

  /** List of scoring jobs */
  jobs?: ScoringJobView[];

  /** Queue statistics */
  stats?: QueueStats;

  /** Callback when a job row is clicked */
  onJobClick?: (jobId: string) => void;

  /** Callback to retry a failed job */
  onRetryJob?: (jobId: string) => void;

  /** Callback to cancel a job */
  onCancelJob?: (jobId: string) => void;

  /** Callback to pause a processing job */
  onPauseJob?: (jobId: string) => void;

  /** Currently selected job ID */
  selectedJobId?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SCORING_JOB_QUEUE_DEFAULTS: Partial<BhScoringJobQueueProps> = {
  preset: 'list',
};

/** Backward-compat alias (old name from pre-migration) */
export type ScoringJob = ScoringJobView;

/** Re-export DB type for convenience */
export type { ScoringJobSelect };
