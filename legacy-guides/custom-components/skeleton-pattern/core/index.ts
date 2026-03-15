import type { EngineAwareProps } from '../../../../types';

export type SkeletonPatternPreset = 'card' | 'profile';

export interface SkeletonPatternProps extends EngineAwareProps {
  preset?: SkeletonPatternPreset;
  rows?: number;
  columns?: number;
  /** Whether to show the shimmer animation */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SKELETON_PATTERN_DEFAULTS: Partial<SkeletonPatternProps> = {
  preset: 'card',
  rows: 5,
  columns: 4,
  animate: true,
};
