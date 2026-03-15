/**
 * BhEmployerBrand - Core Interface
 * Dashboard widget displaying employer brand health metrics.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhEmployerBrandPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Employer brand health data */
export interface EmployerBrandData {
  overallScore: number;
  npsScore: number;
  glassdoorRating?: number;
  applicationRate: number;
  applicationRateTrend: 'up' | 'stable' | 'down';
  candidateSatisfaction: number;
  offerAcceptanceRate: number;
  topPositiveThemes: string[];
  topNegativeThemes: string[];
  reviewCount: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhEmployerBrandProps extends EngineAwareProps {
  preset?: BhEmployerBrandPreset;

  /** Employer brand data */
  data?: EmployerBrandData;

  /** Loading state */
  loading?: boolean;

  /** Callback when "View Brand Report" is clicked */
  onViewDetails?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_EMPLOYER_BRAND_DEFAULTS: Partial<BhEmployerBrandProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
