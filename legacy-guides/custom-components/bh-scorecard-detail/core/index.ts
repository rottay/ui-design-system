/**
 * BhScorecardDetail - Core Interface
 * Detailed scorecard view with dimension breakdowns for BitHire ATS platform
 *
 * Uses ScorecardSelect and DimensionScoreSelect from @rottay/scoring for DB types.
 * UI types are defined here with proper `number` fields for rendering.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ScorecardSelect, DimensionScoreSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhScorecardDetailPreset = 'panel' | 'compact' | 'full' | 'summary';

/** DB scorecard status values */
export type ScorecardStatusValue = ScorecardSelect['status'];

/** DB score level values */
export type ScoreLevelValue = ScorecardSelect['scoreLevel'];

/* ── UI types (what presets actually consume) ───────────────────────── */

/** A single dimension score for UI rendering */
export interface DimensionScore {
  dimensionId?: string;
  dimensionName?: string;
  score?: number;
  maxScore?: number;
  weight?: number;
  weightedScore?: number;
  confidence?: number;
  evidenceCount?: number;
  notes?: string;
  level?: string;
  scoreLevel?: string;
  isKnockout?: boolean;
  knockoutTriggered?: boolean;
  reasoning?: string;
}

/** Aggregated scorecard for UI rendering */
export interface ScorecardDetail {
  id?: string;
  scorableId?: string;
  candidateName?: string;
  jobTitle?: string;
  overallScore?: number;
  maxScore?: number;
  weightedScore?: number;
  scoreLevel?: string;
  passed?: boolean;
  totalWeight?: number;
  dimensions?: DimensionScore[];
  scoredBy?: string;
  scoredAt?: Date | string;
  calibrated?: boolean;
  status?: string;
  scoringMethod?: string;
  llmModel?: string;
  confidence?: number;
  confidenceFactors?: Record<string, unknown>;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  reviewedBy?: string;
  reviewedAt?: Date | string;
  reviewNotes?: string;
  originalScore?: number;
  overrideScore?: number;
  overriddenBy?: string;
  overriddenAt?: Date | string;
  overrideReason?: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  scoringLatencyMs?: number;
}

export interface BhScorecardDetailProps extends EngineAwareProps {
  preset?: BhScorecardDetailPreset;

  /** The scorecard (UI view model) */
  scorecard?: ScorecardDetail;

  /** Dimension scores for this scorecard (alternative to scorecard.dimensions) */
  dimensionScores?: DimensionScore[];

  /** Display name of the candidate (resolved externally) */
  candidateName?: string;

  /** Display name of the job/position (resolved externally) */
  jobTitle?: string;

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

/** Re-export n helper for convenience */
export { n };

/** Re-export DB types for convenience */
export type { ScorecardSelect, DimensionScoreSelect };
