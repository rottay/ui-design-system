import React from 'react';

/**
 * Base props for Skeleton components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface SkeletonBaseProps {
  /** Whether to show the skeleton animation */
  active?: boolean;

  /** Whether to show loading state */
  loading?: boolean;

  /** Additional CSS class name */
  className?: string;

  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Extended props for Skeleton components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface SkeletonProps extends SkeletonBaseProps {
  /** Whether to show avatar skeleton */
  avatar?: boolean | { shape?: 'circle' | 'square'; size?: 'small' | 'medium' | 'large' };

  /** Whether to show title skeleton */
  title?: boolean | { width?: string | number };

  /** Whether to show paragraph skeleton and its configuration */
  paragraph?: boolean | { rows?: number; width?: string | number | Array<string | number> };

  /** Whether to show round skeleton (circular) */
  round?: boolean;

  /** Children to show when loading is false */
  children?: React.ReactNode;
}

/**
 * Normalized avatar configuration
 */
export interface SkeletonAvatarConfig {
  shape: 'circle' | 'square';
  size: 'small' | 'medium' | 'large';
}

/**
 * Normalized title configuration
 */
export interface SkeletonTitleConfig {
  width: string | number;
}

/**
 * Normalized paragraph configuration
 */
export interface SkeletonParagraphConfig {
  rows: number;
  width: string | number | Array<string | number>;
}
