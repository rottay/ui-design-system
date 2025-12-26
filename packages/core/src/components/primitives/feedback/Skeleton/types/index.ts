/**
 * Skeleton - Core Interface
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'pulse' | 'wave' | false;

export interface SkeletonProps extends BaseComponentProps, EngineAwareProps {
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Children elements */
  children?: ReactNode;
  /** Skeleton variant */
  variant?: SkeletonVariant;
  /** Width (number for px or string for any unit) */
  width?: number | string;
  /** Height (number for px or string for any unit) */
  height?: number | string;
  /** Enable animation */
  animation?: SkeletonAnimation;
  /** Number of skeleton rows (for text variant) */
  rows?: number;
  /** Active state (shows animation) */
  active?: boolean;
  /** Show avatar skeleton */
  avatar?: boolean;
  /** Avatar size */
  avatarSize?: number;
  /** Avatar shape */
  avatarShape?: 'circle' | 'square';
  /** Show paragraph skeleton */
  paragraph?: boolean | { rows?: number };
  /** Show title skeleton */
  title?: boolean;
}

export const SKELETON_DEFAULTS: Partial<SkeletonProps> = {
  variant: 'text',
  animation: 'pulse',
  active: true,
  rows: 3,
  avatarSize: 40,
  avatarShape: 'circle',
};
