/**
 * BhScoringJobQueue - Core Interface
 * Scoring job queue management for the BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhScoringJobQueuePreset = 'list' | 'compact';

export type ScoringJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
export type ScoringJobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ScoringJob {
  id: string;
  scorableId: string;
  candidateName: string;
  jobTitle: string;
  rubricName: string;
  status: ScoringJobStatus;
  progress: number;
  priority: ScoringJobPriority;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  errorMessage?: string;
  retryCount: number;
}

export interface QueueStats {
  totalJobs: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
}

export interface BhScoringJobQueueProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhScoringJobQueuePreset;

  /** List of scoring jobs */
  jobs: ScoringJob[];

  /** Queue statistics */
  stats: QueueStats;

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
