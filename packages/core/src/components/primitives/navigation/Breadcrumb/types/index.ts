/**
 * Breadcrumb - Core Interface
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode } from 'react';

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
}

export const BREADCRUMB_DEFAULTS: Partial<BreadcrumbProps> = {
  separator: '/',
};
