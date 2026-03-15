import type { ReactNode, ImgHTMLAttributes } from 'react';
import type { BaseComponentProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Image object-fit type.
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

/**
 * Image component props.
 */
export interface ImageProps extends BaseComponentProps, EngineAwareProps, Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
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
