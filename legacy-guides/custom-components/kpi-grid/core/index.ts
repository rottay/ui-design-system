import type { EngineAwareProps } from '../../../../types';

export type KpiGridPreset = 'cards' | 'compact' | 'detailed';

export interface KpiItem {
  key: string;
  label: string;
  value: string | number;
  icon?: string;
  trend?: number;
  previousValue?: string | number;
  target?: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface KpiGridProps extends EngineAwareProps {
  preset?: KpiGridPreset;
  items: KpiItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  style?: React.CSSProperties;
}

export const KPI_GRID_DEFAULTS = {
  preset: 'cards' as KpiGridPreset,
  items: [],
  columns: 3 as 2 | 3 | 4,
};
