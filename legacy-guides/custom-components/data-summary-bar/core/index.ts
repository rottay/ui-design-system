import type { EngineAwareProps } from '../../../../types';

export type DataSummaryBarPreset = 'pills' | 'inline';

export interface SummaryMetric {
  key: string;
  label: string;
  value: string | number;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface DataSummaryBarProps extends EngineAwareProps {
  preset?: DataSummaryBarPreset;
  metrics: SummaryMetric[];
  className?: string;
  style?: React.CSSProperties;
}

export const DATA_SUMMARY_BAR_DEFAULTS = {
  preset: 'pills' as DataSummaryBarPreset,
  metrics: [],
};
