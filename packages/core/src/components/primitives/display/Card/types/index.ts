/**
 * Card - Core Interface
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends EngineAwareProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const CARD_DEFAULTS: Partial<CardProps> = {
  variant: 'elevated',
  padding: 'md',
  hoverable: false,
};

export const PADDING_MAP = {
  none: 0,
  sm: 12,
  md: 24,
  lg: 32,
};
