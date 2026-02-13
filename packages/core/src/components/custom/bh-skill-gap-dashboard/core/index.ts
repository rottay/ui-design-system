/**
 * BhSkillGapDashboard - Core Interface
 * Comprehensive skill gap analysis for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSkillGapDashboardPreset = 'dashboard' | 'compact';

export interface SkillGapData {
  skill: string;
  required: number;
  current: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  candidatePool: number;
}

export interface BhSkillGapDashboardProps extends EngineAwareProps {
  preset?: BhSkillGapDashboardPreset;

  /** Skill gap data entries */
  skills: SkillGapData[];

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
