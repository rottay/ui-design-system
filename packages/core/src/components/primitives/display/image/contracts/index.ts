/**
 * @fileoverview Image Types - Rottay Design System
 * @description Type definitions, compound component props, and configuration constants
 * for the Image component. Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides all types and constants for the Image component.
 * The Image component supports lazy loading, fallback states, zoom previews,
 * and responsive sizing across all rendering engines.
 *
 * **Type Categories:**
 * - `ImageProps`: Main component props (src, alt, width, height, objectFit, lazy, etc.)
 * - `ImageGroupProps`: Props for grouping multiple images with shared preview
 * - `ImageFit`: CSS object-fit mode (cover, contain, fill, none, scale-down)
 * - `ImageLoadState`: Loading lifecycle state from centralized types
 * - `ImageRadius`: Border radius presets (none, sm, md, lg, full)
 * - `ImageStatus`: Loading status during image lifecycle (loading, loaded, error)
 * - `ImageFallbackProps`: Props for the Image.Fallback compound component
 * - `ImageSkeletonProps`: Props for the Image.Skeleton compound component
 *
 * **Multi-Tenant Support:**
 * Radius values map to CSS custom properties (design tokens), ensuring
 * consistent border-radius across tenant themes.
 *
 * @example Type Usage
 * ```tsx
 * import type { ImageProps, ImageRadius, ImageFallbackProps } from '@rottay/design-system';
 *
 * // Typed image configuration
 * const radius: ImageRadius = 'lg';
 *
 * // Custom fallback for failed loads
 * const fallback: ImageFallbackProps = {
 *   width: 200,
 *   height: 200,
 *   children: <PlaceholderIcon />,
 * };
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { IMAGE_DEFAULTS, RADIUS_MAP } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(IMAGE_DEFAULTS.objectFit); // 'cover'
 * console.log(IMAGE_DEFAULTS.lazy);      // true
 * console.log(IMAGE_DEFAULTS.zoomable);  // false
 *
 * // Access radius CSS values
 * console.log(RADIUS_MAP.lg);            // 'var(--ds-radius-lg, 0.75rem)'
 * console.log(RADIUS_MAP.full);          // 'var(--ds-radius-full, 9999px)'
 * ```
 *
 * @see {@link ImageProps} - Main component props
 * @see {@link IMAGE_DEFAULTS} - Default configuration values
 * @see {@link RADIUS_MAP} - Radius to CSS value mapping
 * @module ImageTypes
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode, ImgHTMLAttributes } from 'react';
import type { BaseComponentProps } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

// ============================================================================
// Type Definitions from Contracts
// ============================================================================

/** CSS object-fit values supported by the Image component. */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/**
 * Image component props.
 */
export interface ImageProps extends BaseComponentProps, EngineAwareProps, Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'dir'> {
  /**
   * Image URL.
   */
  src: string;

  /**
   * Alternative text (required for accessibility).
   */
  alt: string;

  /**
   * Image width.
   */
  width?: number | string;

  /**
   * Image height.
   */
  height?: number | string;

  /**
   * Image object-fit.
   * @default 'cover'
   */
  objectFit?: ImageFit;

  /**
   * Image object-position.
   * @default 'center'
   */
  objectPosition?: string;

  /**
   * Image border radius.
   * @default 'none'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Whether the image has a border.
   */
  bordered?: boolean;

  /**
   * Whether the image has a shadow.
   */
  shadow?: boolean;

  /**
   * Whether the image can zoom on click.
   */
  zoomable?: boolean;

  /**
   * Image load success callback.
   */
  onLoad?: () => void;

  /**
   * Image load error callback.
   */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * Content to show while loading the image.
   */
  placeholder?: ReactNode;

  /**
   * Content to show if load fails.
   */
  fallback?: ReactNode;

  /**
   * Whether to use lazy loading.
   * @default true
   */
  lazy?: boolean;

  /**
   * Image quality (if applicable).
   */
  quality?: number;

  /**
   * Whether the image is in blur mode while loading.
   */
  blurDataURL?: string;

  /**
   * Image click callback.
   */
  onClick?: () => void;

  /**
   * Whether to show overlay on hover.
   */
  hoverOverlay?: ReactNode;

  /**
   * Image aspect ratio.
   */
  aspectRatio?: number | string;
}

/**
 * Image.Group component props (image gallery).
 */
export interface ImageGroupProps extends BaseComponentProps {
  /**
   * Group images.
   */
  children: ReactNode;

  /**
   * Whether to allow preview/lightbox.
   * @default true
   */
  preview?: boolean;

  /**
   * Preview image change callback.
   */
  onPreviewChange?: (index: number) => void;

  /**
   * Initial preview image index.
   */
  defaultPreviewIndex?: number;
}

/**
 * Image load state.
 */
export interface ImageLoadState {
  /** Whether loading */
  loading: boolean;
  /** Whether loaded successfully */
  loaded: boolean;
  /** Error if load failed */
  error?: Error;
}

// ============================================================================
// Local Type Definitions
// ============================================================================

/**
 * Border radius presets for the Image component.
 * Maps to CSS custom properties from the design token system.
 *
 * @type {string}
 *
 * | Value | CSS Value | Description |
 * |-------|-----------|-------------|
 * | `none` | 0 | No border radius |
 * | `sm` | --ds-radius-sm (0.25rem) | Subtle rounding |
 * | `md` | --ds-radius-md (0.5rem) | Moderate rounding |
 * | `lg` | --ds-radius-lg (1rem) | Pronounced rounding |
 * | `full` | --ds-radius-full (9999px) | Fully circular/pill shape |
 */
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Image loading status during its lifecycle.
 * Tracks the current state of the image resource fetch.
 *
 * @type {string}
 *
 * | Value | Description |
 * |-------|-------------|
 * | `loading` | Image is currently being fetched |
 * | `loaded` | Image has been successfully loaded and rendered |
 * | `error` | Image failed to load (network error, 404, etc.) |
 */
export type ImageStatus = 'loading' | 'loaded' | 'error';

// ============================================================================
// Compound Component Props
// ============================================================================

/**
 * Props for the Image.Fallback compound component.
 * Rendered when the image fails to load, providing a graceful degradation
 * experience. Typically shows an icon, placeholder text, or alternative content.
 *
 * @interface ImageFallbackProps
 *
 * @example
 * ```tsx
 * <Image src="/broken-url.jpg" alt="Profile">
 *   <Image.Fallback width={120} height={120}>
 *     <UserIcon />
 *   </Image.Fallback>
 * </Image>
 * ```
 */
export interface ImageFallbackProps {
  /** Additional CSS class name applied to the fallback container. */
  className?: string;

  /** Inline styles applied to the fallback container. */
  style?: React.CSSProperties;

  /** Fallback content to display (icon, text, or custom elements). */
  children?: React.ReactNode;

  /**
   * Width of the fallback container.
   * Number values are treated as pixels.
   * @example 200
   * @example '100%'
   */
  width?: number | string;

  /**
   * Height of the fallback container.
   * Number values are treated as pixels.
   * @example 200
   * @example 'auto'
   */
  height?: number | string;
}

/**
 * Props for the Image.Skeleton compound component.
 * Rendered as a loading placeholder while the image is being fetched.
 * Provides visual feedback to the user that content is loading.
 *
 * @interface ImageSkeletonProps
 *
 * @example
 * ```tsx
 * <Image src="/large-photo.jpg" alt="Photo">
 *   <Image.Skeleton
 *     width={400}
 *     height={300}
 *     radius="md"
 *     animate
 *   />
 * </Image>
 * ```
 */
export interface ImageSkeletonProps {
  /** Additional CSS class name applied to the skeleton element. */
  className?: string;

  /** Inline styles applied to the skeleton element. */
  style?: React.CSSProperties;

  /**
   * Width of the skeleton placeholder.
   * Number values are treated as pixels. Should match the expected image width.
   * @example 400
   * @example '100%'
   */
  width?: number | string;

  /**
   * Height of the skeleton placeholder.
   * Number values are treated as pixels. Should match the expected image height.
   * @example 300
   * @example 'auto'
   */
  height?: number | string;

  /**
   * Border radius applied to the skeleton, matching the image shape.
   * @default 'none'
   */
  radius?: ImageRadius;

  /**
   * Whether the skeleton displays a pulsing animation.
   * @default true
   */
  animate?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for the Image component.
 * Used by engine implementations to ensure consistent behavior
 * when no explicit props are provided.
 *
 * @constant
 *
 * @example Applying Defaults
 * ```tsx
 * import { IMAGE_DEFAULTS } from '@rottay/design-system';
 *
 * const MyImage = (props: ImageProps) => {
 *   const objectFit = props.objectFit ?? IMAGE_DEFAULTS.objectFit;
 *   const lazy = props.lazy ?? IMAGE_DEFAULTS.lazy;
 *   // ...
 * };
 * ```
 */
export const IMAGE_DEFAULTS = {
  /** CSS object-fit mode for how the image fills its container. @default 'cover' */
  objectFit: 'cover' as const,

  /** CSS object-position for alignment within the container. @default 'center' */
  objectPosition: 'center',

  /** Border radius preset applied to the image. @default 'none' */
  radius: 'none' as const,

  /** Whether to use native lazy loading (loading="lazy"). @default true */
  lazy: true,

  /** Whether to display a border around the image. @default false */
  bordered: false,

  /** Whether to apply a box shadow to the image. @default false */
  shadow: false,

  /** Whether to enable click-to-zoom preview behavior. @default false */
  zoomable: false,
};

// ============================================================================
// Radius Mapping
// ============================================================================

/**
 * Border radius mapping from semantic presets to CSS values.
 * Values reference design tokens with pixel fallbacks for environments
 * where CSS custom properties are not available.
 *
 * @constant
 *
 * @example
 * ```tsx
 * import { RADIUS_MAP, ImageRadius } from '@rottay/design-system';
 *
 * const getRadius = (radius: ImageRadius): string => RADIUS_MAP[radius];
 *
 * console.log(getRadius('md'));   // 'var(--ds-radius-md, 0.5rem)'
 * console.log(getRadius('full')); // 'var(--ds-radius-full, 9999px)'
 * ```
 */
export const RADIUS_MAP: Record<ImageRadius, string> = {
  /** No border radius - sharp corners */
  none: '0',
  /** Small radius (0.25rem / 4px) */
  sm: 'var(--ds-radius-sm, 0.375rem)',
  /** Medium radius (0.5rem / 8px) */
  md: 'var(--ds-radius-md, 0.5rem)',
  /** Large radius (1rem / 16px) */
  lg: 'var(--ds-radius-lg, 0.75rem)',
  /** Full radius (9999px) - creates circular shape on square elements */
  full: 'var(--ds-radius-full, 9999px)',
};
