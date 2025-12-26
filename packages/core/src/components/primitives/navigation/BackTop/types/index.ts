/**
 * BackTop Types
 */
import type { ReactNode, CSSProperties, MouseEvent } from 'react';

export interface BackTopProps {
  target?: () => Window | HTMLElement;
  visibilityHeight?: number;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  duration?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const BACKTOP_DEFAULTS: Partial<BackTopProps> = {
  visibilityHeight: 400,
  duration: 450,
};
