/**
 * Breadcrumb - Core Interface
 */

import type { CSSProperties, ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../types';

export interface BreadcrumbItem {
  key: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps extends EngineAwareProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
  /** Optional children for base component */
  children?: ReactNode;
}

export const BREADCRUMB_DEFAULTS: Partial<BreadcrumbProps> = {
  separator: '/',
};
