/**
 * BhSourceEffectiveness - Core Interface
 * Grouped bars for volume+quality with line for hire rate
 *
 * Source/effectiveness analytics are computed from candidate and outreach data.
 * The DB type is referenced for context but the component works with
 * aggregated metrics data.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhSourceEffectivenessPreset = 'detailed' | 'compact';

/**
 * Source metrics data (computed/aggregated from candidates and outreach activities).
 */
export interface SourceMetrics {
  source: string;
  applicants: number;
  qualified: number;
  hired: number;
  hireRate: number;
  qualityScore: number;
  costPerHire?: number;
  totalSpend?: number;
  avgTimeToHire?: number;
  retentionRate90d?: number;
  trend?: 'up' | 'down' | 'flat';
  previousPeriodHired?: number;
}

export interface BhSourceEffectivenessProps extends EngineAwareProps {
  preset?: BhSourceEffectivenessPreset;

  /** Source metrics data (computed/aggregated) */
  sources?: SourceMetrics[];

  /** Title */
  title?: string;

  /** Callback when a source is clicked */
  onSourceClick?: (source: string) => void;

  /** Currently selected source */
  selectedSource?: string | null;

  /** Time period label */
  period?: string;

  /** Whether to show cost columns */
  showCost?: boolean;

  /** Whether to show trend indicators */
  showTrend?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SOURCE_EFFECTIVENESS_DEFAULTS: Partial<BhSourceEffectivenessProps> = {
  preset: 'detailed',
};
