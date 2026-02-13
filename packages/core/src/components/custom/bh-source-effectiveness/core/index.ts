/**
 * BhSourceEffectiveness - Core Interface
 * Grouped bars for volume+quality with line for hire rate
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhSourceEffectivenessPreset = 'detailed' | 'compact';

export interface SourceMetrics {
  source: string;
  applicants: number;
  qualified: number;
  hired: number;
  hireRate: number;
  qualityScore: number;
}

export interface BhSourceEffectivenessProps extends EngineAwareProps {
  preset?: BhSourceEffectivenessPreset;

  /** Source metrics data */
  sources: SourceMetrics[];

  /** Title */
  title?: string;

  /** Callback when a source is clicked */
  onSourceClick?: (source: string) => void;

  /** Currently selected source */
  selectedSource?: string | null;

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
