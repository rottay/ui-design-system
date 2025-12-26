/**
 * Affix Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface AffixProps {
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => Window | HTMLElement;
  onChange?: (affixed: boolean) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const AFFIX_DEFAULTS: Partial<AffixProps> = {
  offsetTop: 0,
};
