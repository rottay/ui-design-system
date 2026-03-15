import type { EngineAwareProps } from '../../../../types';

export type ComparisonTablePreset = 'table' | 'cards';

export interface ComparisonPlan {
  key: string;
  name: string;
  price?: string;
  period?: string;
  description?: string;
  popular?: boolean;
  cta?: {
    label: string;
    onClick: () => void;
  };
}

export interface ComparisonFeature {
  key: string;
  name: string;
  category?: string;
  values: Record<string, boolean | string>;
}

export interface ComparisonTableProps extends EngineAwareProps {
  preset?: ComparisonTablePreset;
  plans: ComparisonPlan[];
  features: ComparisonFeature[];
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const COMPARISON_TABLE_DEFAULTS = {
  preset: 'table' as ComparisonTablePreset,
};
