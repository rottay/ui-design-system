/**
 * BhRecruiterPerformance - Core Interface
 * Radar chart, workload gauges, comparison table for BitHire ATS platform
 *
 * DB Reference: DBRecruiterMetrics from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBRecruiterMetrics } from '@rottay/recruiter';

export type BhRecruiterPerformancePreset = 'dashboard' | 'compact';

/** Re-export for consumer convenience */
export type { DBRecruiterMetrics };

export interface RecruiterPerformanceItem {
  recruiterId?: string;
  name?: string;
  hires?: number;
  timeToFill?: number;
  qualityScore?: number;
  candidateSatisfaction?: number;
  pipelineVelocity?: number;
  activePositions?: number;
  /** Optional raw DB metrics for direct binding */
  dbMetrics?: Partial<DBRecruiterMetrics> | null;
}

export interface BhRecruiterPerformanceProps extends EngineAwareProps {
  preset?: BhRecruiterPerformancePreset;

  /** List of recruiter metrics */
  recruiters?: RecruiterPerformanceItem[];

  /** Currently selected recruiter */
  selectedRecruiterId?: string | null;

  /** Callback when a recruiter is clicked */
  onRecruiterClick?: (id: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_RECRUITER_PERFORMANCE_DEFAULTS: Partial<BhRecruiterPerformanceProps> = {
  preset: 'dashboard',
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use DBRecruiterMetrics instead */
export type RecruiterMetrics = DBRecruiterMetrics;
