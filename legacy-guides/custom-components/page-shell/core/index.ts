import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type PageShellPreset = 'standard' | 'compact';

export interface PageShellTab {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface PageShellBreadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageShellAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}

export interface PageShellProps extends EngineAwareProps {
  preset?: PageShellPreset;
  title: string;
  description?: string;
  breadcrumbs?: PageShellBreadcrumb[];
  actions?: PageShellAction[];
  tabs?: PageShellTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PAGE_SHELL_DEFAULTS: Partial<PageShellProps> = {
  preset: 'standard',
};
