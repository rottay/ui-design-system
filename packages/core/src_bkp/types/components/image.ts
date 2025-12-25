/**
 * Image Component Types
 *
 * Unified type definitions for Image component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, ImgHTMLAttributes } from 'react';

/**
 * Image fit/object-fit type
 */
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

/**
 * Image loading strategy
 */
export type ImageLoading = 'lazy' | 'eager';

/**
 * Preview configuration for image lightbox/modal
 */
export interface PreviewConfig {
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  mask?: ReactNode;
  maskClassName?: string;
  zIndex?: number;
}

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface ImageBaseProps {
  // Image source
  src: string;
  alt?: string;

  // Dimensions
  width?: string | number;
  height?: string | number;

  // Fallback handling
  fallback?: string;
  placeholder?: ReactNode | string;

  // Object fit
  fit?: ImageFit;

  // Loading strategy
  loading?: ImageLoading;

  // Styling
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  rootStyle?: CSSProperties;

  // Event handlers
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface ImageProps extends ImageBaseProps {
  // Preview/lightbox support (titan primary support, apollo optional)
  preview?: boolean | PreviewConfig;

  // Additional HTML attributes (apollo/hermes support)
  title?: string;
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>['crossOrigin'];
  decoding?: ImgHTMLAttributes<HTMLImageElement>['decoding'];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  sizes?: string;
  srcSet?: string;
  useMap?: string;

  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}

/**
 * Type guard to check if preview is a config object
 */
export function isPreviewConfig(preview?: boolean | PreviewConfig): preview is PreviewConfig {
  return typeof preview === 'object';
}

/**
 * Type guard to check if placeholder is a ReactNode
 */
export function isReactNodePlaceholder(
  placeholder?: ReactNode | string
): placeholder is ReactNode {
  return typeof placeholder !== 'string';
}
