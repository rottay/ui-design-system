import type { ReactNode } from 'react';
import type { DividerProps as AntDividerProps } from 'antd';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerSpacing = 'sm' | 'md' | 'lg';

export interface DividerProps extends Omit<AntDividerProps, 'type' | 'dashed' | 'orientation'> {
  /** Divider orientation */
  orientation?: DividerOrientation;
  /** Text or content to display in divider */
  label?: ReactNode;
  /** Divider line variant */
  variant?: DividerVariant;
  /** Margin spacing around divider */
  spacing?: DividerSpacing;
}
