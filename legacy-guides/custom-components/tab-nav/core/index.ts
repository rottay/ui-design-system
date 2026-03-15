import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type TabNavPreset = 'underline' | 'pills' | 'boxed';

export interface TabNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  closeable?: boolean;
  disabled?: boolean;
}

export interface TabNavProps extends EngineAwareProps {
  preset?: TabNavPreset;
  items: TabNavItem[];
  activeKey?: string;
  onTabChange?: (key: string) => void;
  onTabClose?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const TAB_NAV_DEFAULTS = {
  preset: 'underline' as TabNavPreset,
};
