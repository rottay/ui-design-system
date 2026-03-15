import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface PageShellProps extends PatternBaseProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
  actions?: ReactNode;
  tabs?: { key: string; label: string; content: ReactNode }[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  children: ReactNode;
  back?: { label?: string; onClick: () => void };
  badge?: ReactNode;
  maxWidth?: number | string;
}
