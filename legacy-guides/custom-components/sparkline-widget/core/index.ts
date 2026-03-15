import type { EngineAwareProps } from '../../../../types';

export type SparklineWidgetPreset = 'line' | 'bar' | 'area';

export interface SparklineWidgetProps extends EngineAwareProps {
  preset?: SparklineWidgetPreset;
  data: number[];
  color?: 'primary' | 'success' | 'warning' | 'error';
  width?: number;
  height?: number;
  showValue?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SPARKLINE_WIDGET_DEFAULTS = {
  preset: 'line' as SparklineWidgetPreset,
  data: [],
  color: 'primary' as 'primary' | 'success' | 'warning' | 'error',
  width: 100,
  height: 30,
  showValue: false,
};
