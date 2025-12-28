/**
 * @fileoverview Container Types - Rottay Design System
 * @description Type definitions for the Container layout component.
 * Provides comprehensive typing for max-width, padding, and centering options.
 *
 * @remarks
 * The Container component uses a breakpoint-based max-width system that aligns
 * with common screen sizes. The type system provides both preset values and
 * support for custom numeric values.
 *
 * Preset Max-widths:
 * - `sm`: 640px - Mobile landscape / small tablet
 * - `md`: 768px - Tablet portrait
 * - `lg`: 1024px - Tablet landscape / small desktop (default)
 * - `xl`: 1280px - Desktop
 * - `2xl`: 1536px - Large desktop
 * - `full`: 100% - Full width
 *
 * @example Type Usage
 * ```tsx
 * import type { ContainerProps, ContainerMaxWidth, ContainerPadding } from '@rottay/design-system';
 *
 * // Create a page wrapper component
 * interface PageProps extends Partial<ContainerProps> {
 *   title: string;
 * }
 *
 * // Type-safe max-width values
 * const maxWidth: ContainerMaxWidth = 'lg';
 * const padding: ContainerPadding = 'md';
 * ```
 *
 * @see {@link Container} - The main Container component
 * @module Container/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ContainerProps {
  /** Maximum width of the container */
  maxWidth?: ContainerMaxWidth | number;
  /** Center the container horizontally */
  center?: boolean;
  /** Padding inside the container */
  padding?: ContainerPadding | number;
  /** If true, container takes full width of parent */
  fluid?: boolean;
  /** Container content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export const CONTAINER_DEFAULTS: Partial<ContainerProps> = {
  center: true,
  padding: 'md',
  fluid: false,
  maxWidth: 'lg',
};

/** Max width values in pixels */
export const CONTAINER_MAX_WIDTHS: Record<ContainerMaxWidth, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

/** Padding values in pixels */
export const CONTAINER_PADDINGS: Record<ContainerPadding, string> = {
  none: '0',
  sm: '8px',
  md: '16px',
  lg: '24px',
};
