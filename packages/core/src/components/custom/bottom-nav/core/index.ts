import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type BottomNavPreset = 'standard' | 'labeled';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  href?: string;
  onClick?: () => void;
}

export interface BottomNavProps extends EngineAwareProps {
  preset?: BottomNavPreset;
  items: BottomNavItem[];
  activeKey?: string;
  onItemClick?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BOTTOM_NAV_DEFAULTS = {
  preset: 'standard' as BottomNavPreset,
};
