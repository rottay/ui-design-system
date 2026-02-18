/**
 * BhSkillGapDashboard - Core Interface
 * Comprehensive skill gap analysis for BitHire ATS platform
 *
 * Uses SkillGapAnalysisSelect from @rottay/scoring for entity reference.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { SkillGapAnalysisSelect } from '@rottay/scoring';

export type BhSkillGapDashboardPreset = 'dashboard' | 'compact';

export interface SkillGapData {
  skill?: string;
  required?: number;
  current?: number;
  gap?: number;
  priority?: 'high' | 'medium' | 'low';
  candidatePool?: number;
  /** Overall gap score across all dimensions (from SkillGapAnalysisSelect.overallGap) */
  overallGap?: number;
  /** Recommendations for closing the gap (from SkillGapAnalysisSelect.recommendations) */
  recommendations?: string[];
}

export interface BhSkillGapDashboardProps extends EngineAwareProps {
  preset?: BhSkillGapDashboardPreset;

  /** The DB entity for reference (all fields optional for safety) */
  analysis?: Partial<SkillGapAnalysisSelect>;

  /** Skill gap data entries (UI-computed from analysis.gaps) */
  skills?: SkillGapData[];

  /** Department label */
  department?: string;

  /** Dashboard title */
  title?: string;

  /** Callback when a skill is clicked */
  onSkillClick?: (skill: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SKILL_GAP_DASHBOARD_DEFAULTS: Partial<BhSkillGapDashboardProps> = {
  preset: 'dashboard',
  title: 'Skill Gap Analysis',
};

/** Re-export DB type for convenience */
export type { SkillGapAnalysisSelect };
