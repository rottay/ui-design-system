import type { BaseComponentProps } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

/**
 * Image object-fit values.
 */
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

/**
 * Image loading strategies.
 */
export type ImageLoading = 'eager' | 'lazy';

/**
 * Border radius options for images.
 */
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Image loading status.
 */
export type ImageStatus = 'loading' | 'loaded' | 'error';

/**
 * Props for the Image component.
 */
export interface ImageProps extends BaseComponentProps, EngineAwareProps {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Object fit */
  fit?: ImageFit;
  /** Loading strategy */
  loading?: ImageLoading;
  /** Fallback image URL */
  fallbackSrc?: string;
  /** Custom fallback element */
  fallback?: React.ReactNode;
  /** Show skeleton while loading */
  showSkeleton?: boolean;
  /** Border radius */
  radius?: ImageRadius;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Load callback */
  onLoad?: () => void;
}

/**
 * Props for the Image.Fallback component.
 */
export interface ImageFallbackProps extends BaseComponentProps {
  /** Fallback content */
  children?: React.ReactNode;
}

/**
 * Props for the Image.Skeleton component.
 */
export interface ImageSkeletonProps extends BaseComponentProps {
  /** Width of skeleton */
  width?: number | string;
  /** Height of skeleton */
  height?: number | string;
  /** Border radius */
  radius?: ImageRadius;
}
