/**
 * BhHiringFunnel - Core Interface
 * Interactive funnel chart showing pipeline stages with click-to-drill
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhHiringFunnelPreset = 'funnel' | 'compact';

export interface FunnelStage {
  name?: string;
  count?: number;
  conversionRate?: number;
  color?: string;
  previousCount?: number;
  trend?: 'up' | 'down' | 'flat';
  avgDaysInStage?: number;
  dropoffCount?: number;
}

export interface BhHiringFunnelProps extends EngineAwareProps {
  preset?: BhHiringFunnelPreset;

  /** Funnel stages data */
  stages?: FunnelStage[];

  /** Title for the funnel chart */
  title?: string;

  /** Callback when a stage is clicked */
  onStageClick?: (stageName: string) => void;

  /** Currently selected stage */
  selectedStage?: string | null;

  /** Total applicants across all stages */
  totalApplicants?: number;

  /** Total hires */
  totalHires?: number;

  /** Overall conversion rate (applicants to hires) */
  overallConversionRate?: number;

  /** Time period label */
  period?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_HIRING_FUNNEL_DEFAULTS: Partial<BhHiringFunnelProps> = {
  preset: 'funnel',
};
