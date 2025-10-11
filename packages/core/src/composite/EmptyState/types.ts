import type { ReactNode } from 'react';

export type EmptyStateVariant =
  | 'no-data'
  | 'no-results'
  | 'error'
  | '404'
  | 'offline'
  | 'maintenance';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  icon?: ReactNode;
}

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  actions?: EmptyStateAction[];
  size?: EmptyStateSize;
  className?: string;
  style?: React.CSSProperties;
}
