import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type SplitLayoutPreset = 'resizable' | 'fixed' | 'responsive';

export interface SplitLayoutProps extends EngineAwareProps {
  preset?: SplitLayoutPreset;
  left: ReactNode;
  right: ReactNode;
  initialSplit?: number;
  minWidth?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const SPLIT_LAYOUT_DEFAULTS = {
  preset: 'resizable' as SplitLayoutPreset,
  initialSplit: 50,
  minWidth: 200,
  orientation: 'horizontal' as 'horizontal' | 'vertical',
};
