/**
 * Button Component Types
 *
 * Unified type definitions for Button component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, MouseEvent, ReactNode } from 'react';

/**
 * Base Button Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface ButtonBaseProps {
  /** Button content */
  children?: ReactNode;

  /** Click handler */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /** Disabled state */
  disabled?: boolean;

  /** Loading state (shows spinner) */
  loading?: boolean | { delay?: number };

  /** HTML button type */
  htmlType?: 'button' | 'submit' | 'reset';

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Accessibility label */
  'aria-label'?: string;

  /** Tab index */
  tabIndex?: number;
}

/**
 * Button Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface ButtonProps extends ButtonBaseProps {
  /**
   * Button variant/type
   * - titan: all variants supported
   * - hermes: primary, secondary, ghost, link (others map to closest)
   * - apollo: all variants supported via Tailwind
   */
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link';

  /**
   * Button size
   * - titan: small, middle, large
   * - hermes: xs, sm, md, lg (mapped from small/middle/large)
   * - apollo: small, middle, large
   */
  size?: 'small' | 'middle' | 'large';

  /**
   * Danger state (red/error styling)
   * Supported by all engines
   */
  danger?: boolean;

  /**
   * Ghost mode (transparent background)
   * - titan: full support
   * - hermes: native support
   * - apollo: full support
   */
  ghost?: boolean;

  /**
   * Full width button
   * Supported by all engines
   */
  block?: boolean;

  /**
   * Alternative name for block (backwards compatibility)
   * Supported by all engines
   */
  fullWidth?: boolean;

  /**
   * Button shape
   * - titan: full support
   * - hermes: maps to square/circle classes
   * - apollo: full support via Tailwind
   * @engine-specific May be ignored in some engines
   */
  shape?: 'default' | 'circle' | 'round';

  /**
   * Icon element
   * - titan: positioned automatically
   * - hermes: rendered as child
   * - apollo: rendered with gap spacing
   */
  icon?: ReactNode;

  /**
   * Button ID attribute
   */
  id?: string;

  /**
   * Button name attribute
   */
  name?: string;

  /**
   * Button value attribute
   */
  value?: string | number;
}

/**
 * Type guard to check if loading is an object
 */
export function isLoadingWithDelay(
  loading: boolean | { delay?: number } | undefined
): loading is { delay?: number } {
  return typeof loading === 'object' && loading !== null;
}

/**
 * Extract boolean loading state
 */
export function getLoadingState(
  loading: boolean | { delay?: number } | undefined
): boolean {
  if (loading === undefined) return false;
  if (typeof loading === 'boolean') return loading;
  return true; // If it's an object, we're loading
}
