/**
 * Segmented Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface SegmentedOption {
  label: ReactNode;
  value: string | number;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SegmentedProps {
  options: (string | number | SegmentedOption)[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  block?: boolean;
  disabled?: boolean;
  size?: 'large' | 'middle' | 'small';
  className?: string;
  style?: CSSProperties;
}

export const SEGMENTED_DEFAULTS: Partial<SegmentedProps> = {
  size: 'middle',
  block: false,
  disabled: false,
};
