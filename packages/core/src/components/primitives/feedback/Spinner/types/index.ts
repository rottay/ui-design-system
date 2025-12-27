/**
 * @fileoverview Spinner Component Types - Rottay Design System
 * @description Type definitions for the Spinner component including props,
 * size variants, and default configuration values.
 *
 * @remarks
 * These types ensure type safety across all three rendering engines
 * (Titan, Hermes, Apollo) while maintaining a consistent API surface.
 *
 * @module Spinner/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../../types';

// ============================================================================
// Size Type
// ============================================================================

/**
 * Available size variants for the Spinner component.
 *
 * @description
 * Size presets that map to CSS variables for consistent sizing across engines:
 * - `sm` - Small spinner (16-20px), ideal for inline or button loading
 * - `md` - Medium spinner (24-32px), default size for general use
 * - `lg` - Large spinner (40-48px), for section or modal loading
 * - `xl` - Extra large spinner (56-64px), for full-page loading overlays
 *
 * @example
 * ```tsx
 * const size: SpinnerSize = 'lg';
 * <Spinner size={size} />
 * ```
 */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// Props Interface
// ============================================================================

/**
 * Props interface for the Spinner component.
 *
 * @description
 * Defines all available props for configuring spinner appearance and behavior.
 * Extends EngineAwareProps to support multi-engine rendering.
 *
 * @extends EngineAwareProps - Provides engine override capability
 *
 * @example
 * ```tsx
 * const spinnerProps: SpinnerProps = {
 *   size: 'lg',
 *   color: '#1890ff',
 *   label: 'Loading...',
 *   engine: 'hermes',
 * };
 * ```
 */
export interface SpinnerProps extends EngineAwareProps {
  /**
   * Size variant of the spinner.
   * Maps to CSS variables for consistent sizing.
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Custom color for the spinner.
   * Accepts any valid CSS color value.
   * @example '#1890ff', 'var(--color-primary)', 'rgb(139, 92, 246)'
   */
  color?: string;

  /**
   * Accessible label text displayed below the spinner.
   * Also used for screen reader announcements.
   * @example 'Loading...', 'Processing your request'
   */
  label?: string;

  /**
   * Additional CSS class names to apply.
   * Merged with default component classes.
   */
  className?: string;

  /**
   * Inline styles to apply to the spinner container.
   * Useful for positioning and spacing adjustments.
   */
  style?: CSSProperties;

  /**
   * Optional children to render alongside the spinner.
   * Can be used for custom loading content.
   */
  children?: ReactNode;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default prop values for the Spinner component.
 *
 * @description
 * Provides sensible defaults that ensure consistent behavior
 * when optional props are not specified.
 *
 * @example
 * ```tsx
 * const { size = SPINNER_DEFAULTS.size } = props;
 * // size will be 'md' if not provided
 * ```
 */
export const SPINNER_DEFAULTS: Partial<SpinnerProps> = {
  /** Default size is medium for balanced visibility */
  size: 'md',
};

// ============================================================================
// Size Mapping
// ============================================================================

/**
 * Maps size variants to CSS variable values.
 *
 * @description
 * Used by engine implementations to resolve size props to actual
 * CSS values from the design token system.
 *
 * @example
 * ```tsx
 * const spinnerSize = SIZE_MAP[size]; // 'var(--spinner-md-size)'
 * ```
 */
export const SIZE_MAP = {
  /** Small: 16-20px for inline/button loading */
  sm: 'var(--spinner-sm-size)',
  /** Medium: 24-32px for general loading states */
  md: 'var(--spinner-md-size)',
  /** Large: 40-48px for section loading */
  lg: 'var(--spinner-lg-size)',
  /** Extra Large: 56-64px for full-page overlays */
  xl: 'var(--spinner-xl-size)',
};
