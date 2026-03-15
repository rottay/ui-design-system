import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PageHeaderPreset = 'standard' | 'compact' | 'hero';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'default' | 'ghost' | 'danger';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface PageHeaderProps extends EngineAwareProps {
  preset?: PageHeaderPreset;
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: PageHeaderAction[];
  extra?: ReactNode;
  icon?: ReactNode;
  status?: ReactNode;
  divider?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const PAGE_HEADER_DEFAULTS: Partial<PageHeaderProps> = {
  preset: 'standard',
  divider: true,
};
