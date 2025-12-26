/**
 * Tabs - Core Interface
 */

import type React from 'react';
import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../types';

export interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export type TabsType = 'line' | 'card' | 'pills';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabsProps extends EngineAwareProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  type?: TabsType;
  size?: TabsSize;
  centered?: boolean;
  onChange?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export const TABS_DEFAULTS: Partial<TabsProps> = {
  type: 'line',
  size: 'md',
  centered: false,
};
