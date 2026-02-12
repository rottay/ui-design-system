import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export interface EmptyStateProps extends PatternBaseProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'default' };
  secondaryAction?: { label: string; onClick: () => void };
  image?: string;
  size?: 'sm' | 'md' | 'lg';
}
