/**
 * BhScorecardDetail - Core Interface
 * Detailed scorecard view with dimension breakdowns for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhScorecardDetailPreset = 'panel' | 'compact' | 'full' | 'summary';

export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  score: number; // 0-5
  maxScore: number;
  weight: number;
  confidence: number; // 0-1
  evidenceCount: number;
  notes?: string;
}

export interface ScorecardDetail {
  id: string;
  scorableId: string;
  candidateName: string;
  jobTitle?: string;
  overallScore: number; // 0-5
  maxScore: number;
  dimensions: DimensionScore[];
  scoredBy: string;
  scoredAt: Date;
  calibrated: boolean;
  status: 'draft' | 'submitted' | 'calibrated';
}

export interface BhScorecardDetailProps extends EngineAwareProps {
  preset?: BhScorecardDetailPreset;

  /** The scorecard data to display */
  scorecard: ScorecardDetail;

  /** Callback when a dimension row is clicked */
  onDimensionClick?: (dimensionId: string) => void;

  /** Callback when calibrate button is clicked */
  onCalibrateClick?: () => void;

  /** Callback when export button is clicked */
  onExportClick?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SCORECARD_DETAIL_DEFAULTS: Partial<BhScorecardDetailProps> = {
  preset: 'panel',
};
