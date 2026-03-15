/**
 * BhCollaborationScore - Core Interface
 * Dashboard widget displaying hiring team collaboration metrics.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhCollaborationScorePreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single collaboration dimension */
export interface CollabDimension {
  name: string;
  score: number;
  weight: number;
}

/** Full collaboration data */
export interface CollaborationData {
  overallScore: number;
  trend: 'up' | 'stable' | 'down';
  dimensions: CollabDimension[];
  topCollaborator: {
    name: string;
    score: number;
  };
  teamSize: number;
  responseRate: number;
  avgFeedbackTime: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhCollaborationScoreProps extends EngineAwareProps {
  preset?: BhCollaborationScorePreset;

  /** Collaboration data */
  data?: CollaborationData;

  /** Loading state */
  loading?: boolean;

  /** Callback when "View Details" or "Improve Score" is clicked */
  onViewDetails?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_COLLABORATION_SCORE_DEFAULTS: Partial<BhCollaborationScoreProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
