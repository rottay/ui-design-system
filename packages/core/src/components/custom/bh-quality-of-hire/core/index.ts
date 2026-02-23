/**
 * BhQualityOfHire - Core Interface
 * Dashboard widget tracking quality of hire metrics and recent hire performance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhQualityOfHirePreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Individual hire quality assessment */
export interface HireQuality {
  candidateName: string;
  hireDate: Date | string;
  qualityScore: number;
  status: 'exceeding' | 'meeting' | 'below';
}

/** Quality of Hire dimension score */
export interface QohDimension {
  name: string;
  score: number;
}

/** Complete quality of hire dataset */
export interface QualityOfHireData {
  overallScore: number;
  trend: 'improving' | 'stable' | 'declining';
  recentHires: HireQuality[];
  dimensions: QohDimension[];
  avgTimeToProductivity: number;
  retentionRate6Month: number;
  managerSatisfaction: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhQualityOfHireProps extends EngineAwareProps {
  preset?: BhQualityOfHirePreset;

  /** Quality of hire data */
  data?: QualityOfHireData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a hire is clicked */
  onViewHire?: (candidateName: string) => void;

  /** Callback when "View All Hires" is clicked */
  onViewAll?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_QUALITY_OF_HIRE_DEFAULTS: Partial<BhQualityOfHireProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
