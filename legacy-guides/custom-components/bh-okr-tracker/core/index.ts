/**
 * BhOkrTracker - Core Interface
 * Dashboard widget for tracking OKR objectives and key results.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhOkrTrackerPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single key result under an objective */
export interface KeyResult {
  title: string;
  current: number;
  target: number;
  unit: string;
}

/** An OKR objective with progress and key results */
export interface OkrObjective {
  id: string;
  title: string;
  progress: number;
  target: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  keyResults: KeyResult[];
}

/** Full OKR tracker dataset */
export interface OkrTrackerData {
  objectives: OkrObjective[];
  overallProgress: number;
  onTrackCount: number;
  behindCount: number;
  period: string;
  daysRemaining: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhOkrTrackerProps extends EngineAwareProps {
  preset?: BhOkrTrackerPreset;

  /** OKR tracker data */
  data?: OkrTrackerData;

  /** Loading state */
  loading?: boolean;

  /** Callback when an objective is clicked */
  onViewObjective?: (objectiveId: string) => void;

  /** Callback when "View All" is clicked */
  onViewAll?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_OKR_TRACKER_DEFAULTS: Partial<BhOkrTrackerProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
