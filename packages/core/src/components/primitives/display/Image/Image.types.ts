/**
 * @fileoverview Image Types - Rottay Design System
 * @description Type definitions for the Image component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized types definition
 * and provides default values and configuration maps for the Image component.
 *
 * **Exported Types:**
 * - `ImageProps` - Main component props interface
 * - `ImageFit` - Object-fit mode (cover, contain, fill, none, scale-down)
 * - `ImageRadius` - Border radius options
 * - `ImageStatus` - Loading state (loading, loaded, error)
 * - `ImageFallbackProps` - Fallback compound props
 * - `ImageSkeletonProps` - Skeleton compound props
 *
 * **Configuration Constants:**
 * - `IMAGE_DEFAULTS` - Default prop values
 * - `RADIUS_MAP` - Radius to CSS value mapping
 *
 * @example Type Usage
 * ```tsx
 * import type { ImageProps, ImageRadius } from '@rottay/design-system';
 *
 * const radius: ImageRadius = 'lg';
 * ```
 *
 * @see {@link Image} for the main component
 * @module ImageTypes
 * @category Display
 * @package @rottay/design-system
 */

export type {
  ImageFit,
  ImageProps,
  ImageGroupProps,
  ImageLoadState,
} from '../../../../contracts/primitives/display/Image';

/**
 * Image radius options for border-radius styling.
 */
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Image loading status during lifecycle.
 */
export type ImageStatus = 'loading' | 'loaded' | 'error';

/**
 * Props for the Image.Fallback compound component.
 * Displayed when the image fails to load.
 */
export interface ImageFallbackProps {
  /** Custom CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Fallback content to display */
  children?: React.ReactNode;
  /** Width of the fallback container */
  width?: number | string;
  /** Height of the fallback container */
  height?: number | string;
}

/**
 * Props for the Image.Skeleton compound component.
 * Displayed while the image is loading.
 */
export interface ImageSkeletonProps {
  /** Custom CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number | string;
  /** Border radius style */
  radius?: ImageRadius;
  /** Whether to animate the skeleton */
  animate?: boolean;
}

/**
 * Default values for Image component props.
 */
export const IMAGE_DEFAULTS = {
  objectFit: 'cover' as const,
  objectPosition: 'center',
  radius: 'none' as const,
  lazy: true,
  bordered: false,
  shadow: false,
  zoomable: false,
};

/**
 * Radius mapping to CSS values (matches design tokens).
 */
export const RADIUS_MAP: Record<ImageRadius, string> = {
  none: '0',
  sm: 'var(--ds-radius-sm, 0.25rem)',
  md: 'var(--ds-radius-md, 0.5rem)',
  lg: 'var(--ds-radius-lg, 1rem)',
  full: 'var(--ds-radius-full, 9999px)',
};
