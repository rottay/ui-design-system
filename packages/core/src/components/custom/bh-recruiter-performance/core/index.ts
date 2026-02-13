/**
 * BhRecruiterPerformance - Core Interface
 * Radar chart, workload gauges, comparison table for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhRecruiterPerformancePreset = 'dashboard' | 'compact';

export interface RecruiterMetrics {
  recruiterId: string;
  name: string;
  hires: number;
  timeToFill: number;
  qualityScore: number;
  candidateSatisfaction: number;
  pipelineVelocity: number;
  activePositions: number;
}

export interface BhRecruiterPerformanceProps extends EngineAwareProps {
  preset?: BhRecruiterPerformancePreset;

  /** List of recruiter metrics */
  recruiters: RecruiterMetrics[];

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
