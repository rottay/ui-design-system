/**
 * Steps Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepItem {
  title: ReactNode;
  subTitle?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface ProgressDotInfo {
  index: number;
  status: StepStatus;
  title: ReactNode;
  description: ReactNode;
}

export interface StepsProps {
  current?: number;
  direction?: 'horizontal' | 'vertical';
  initial?: number;
  labelPlacement?: 'horizontal' | 'vertical';
  percent?: number;
  progressDot?: boolean | ((info: ProgressDotInfo) => ReactNode);
  responsive?: boolean;
  size?: 'default' | 'small';
  status?: StepStatus;
  type?: 'default' | 'navigation' | 'inline';
  onChange?: (current: number) => void;
  items: StepItem[];
  className?: string;
  style?: CSSProperties;
}

export const STEPS_DEFAULTS: Partial<StepsProps> = {
  current: 0,
  direction: 'horizontal',
  initial: 0,
  labelPlacement: 'horizontal',
  responsive: true,
  size: 'default',
  status: 'process',
  type: 'default',
};
