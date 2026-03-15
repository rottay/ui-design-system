import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type EmptyStatePreset = 'standard' | 'illustration';

export interface EmptyStateAction {
  key: string;
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  icon?: ReactNode;
}

export interface EmptyStateProps extends EngineAwareProps {
  preset?: EmptyStatePreset;
  title?: string;
  description?: string;
  icon?: ReactNode;
  illustration?: ReactNode;
  actions?: EmptyStateAction[];
  className?: string;
  style?: React.CSSProperties;
}

export const EMPTY_STATE_DEFAULTS: Partial<EmptyStateProps> = {
  preset: 'standard',
  title: 'No items found',
  description: 'There are no items to display.',
};
