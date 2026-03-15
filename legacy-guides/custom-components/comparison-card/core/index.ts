import type { EngineAwareProps } from '../../../../types';

export type ComparisonCardPreset = 'side-by-side' | 'stacked';

export interface ComparisonMetric {
  label: string;
  current: number | string;
  previous: number | string;
  unit?: string;
  format?: 'number' | 'percentage' | 'currency';
}

export interface ComparisonCardProps extends EngineAwareProps {
  preset?: ComparisonCardPreset;
  metrics: ComparisonMetric[];
  title?: string;
  period?: {
    current: string;
    previous: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const COMPARISON_CARD_DEFAULTS = {
  preset: 'side-by-side' as ComparisonCardPreset,
  metrics: [],
  period: {
    current: 'Current',
    previous: 'Previous',
  },
};
