import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type AppShellPreset = 'standard' | 'stacked' | 'horizontal';

export interface AppShellProps extends EngineAwareProps {
  preset?: AppShellPreset;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  sidebarWidth?: number;
  sidebarCollapsed?: boolean;
  onSidebarCollapse?: (collapsed: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const APP_SHELL_DEFAULTS: Partial<AppShellProps> = {
  preset: 'standard',
  sidebarWidth: 260,
};
