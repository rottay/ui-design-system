/**
 * Avatar Component Types
 *
 * Unified type definitions for Avatar component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Size type - supports both preset sizes and custom number sizes
 */
export type AvatarSize = 'small' | 'default' | 'large' | number;

/**
 * Shape type - avatar can be circle or square
 */
export type AvatarShape = 'circle' | 'square';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface AvatarBaseProps {
  // Image content
  src?: string;
  srcSet?: string;
  alt?: string;

  // Size configuration
  size?: AvatarSize;

  // Shape configuration
  shape?: AvatarShape;

  // Icon fallback (when no src or children)
  icon?: ReactNode;

  // Text fallback (initials or name)
  children?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Event handlers
  onError?: () => boolean | void;

  // Accessibility
  'aria-label'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface AvatarProps extends AvatarBaseProps {
  // Drag and drop support (titan primary support)
  draggable?: boolean;

  // Cross-origin for images (titan primary support)
  crossOrigin?: 'anonymous' | 'use-credentials' | '';

  // Gap between avatar and text in group (titan primary support)
  gap?: number;
}

/**
 * Type guard to check if size is a number
 */
export function isNumericSize(size?: AvatarSize): size is number {
  return typeof size === 'number';
}

/**
 * Type guard to check if size is a preset string
 */
export function isPresetSize(size?: AvatarSize): size is 'small' | 'default' | 'large' {
  return typeof size === 'string';
}
