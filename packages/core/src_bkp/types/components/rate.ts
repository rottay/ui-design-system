/**
 * Rate Component Types
 *
 * Unified type definitions for Rate component across all engines.
 * These types are implemented by titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base Rate Props
 *
 * Common properties supported by ALL engines.
 * All engines MUST implement these props.
 */
export interface RateBaseProps {
  /** Current rating value (controlled) */
  value?: number;

  /** Default rating value (uncontrolled) */
  defaultValue?: number;

  /** Change handler - called when rating value changes */
  onChange?: (value: number) => void;

  /** Total number of stars/icons (default: 5) */
  count?: number;

  /** Disabled state - prevents interaction */
  disabled?: boolean;

  /** Custom CSS classes */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Rate Props
 *
 * Extended properties with engine-specific features.
 * Some props may be ignored by certain engines.
 */
export interface RateProps extends RateBaseProps {
  /**
   * Allow selecting half stars
   * - titan: full support
   * - hermes: full support (using CSS half-star styling)
   * - apollo: full support (using CSS half-star styling)
   */
  allowHalf?: boolean;

  /**
   * Allow clearing rating by clicking again
   * - titan: full support
   * - hermes: full support
   * - apollo: full support
   */
  allowClear?: boolean;

  /**
   * Custom character to display instead of star
   * Can be a string, emoji, or React element
   * - titan: full support (ReactNode)
   * - hermes: limited support (string/emoji only)
   * - apollo: limited support (string/emoji only)
   * @engine-specific Complex ReactNodes best supported in titan
   */
  character?: ReactNode;

  /**
   * Tooltip text array for each star
   * Index corresponds to star number (1-indexed)
   * - titan: full support
   * - hermes: limited support (title attribute)
   * - apollo: limited support (title attribute)
   * @engine-specific Full tooltip support in titan, basic in others
   */
  tooltips?: string[];

  /**
   * Hover change handler - called when hovering over stars
   * Useful for showing preview text or updating UI during hover
   * - titan: full support
   * - hermes: full support
   * - apollo: full support
   */
  onHoverChange?: (value: number) => void;

  /**
   * Auto focus on mount
   * Native HTML behavior
   */
  autoFocus?: boolean;

  /**
   * Tab index for keyboard navigation
   * Native HTML behavior
   */
  tabIndex?: number;

  /**
   * ID attribute
   * Native HTML behavior
   */
  id?: string;

  /**
   * Size of the rating component
   * - titan: uses Ant Design sizing
   * - hermes: xs, sm, md, lg
   * - apollo: custom sizing via CSS classes
   * @engine-specific Different implementations per engine
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Color variant
   * - titan: uses theme colors
   * - hermes: primary, secondary, accent, warning, info, success, error
   * - apollo: uses theme colors
   * @engine-specific Primarily for hermes engine
   */
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'info' | 'success' | 'error';
}

/**
 * Utility: Get tooltip text for a specific star index
 */
export function getTooltipText(tooltips: string[] | undefined, index: number): string | undefined {
  if (!tooltips) return undefined;
  // tooltips array is 0-indexed but star values are 1-indexed
  return tooltips[index - 1];
}

/**
 * Utility: Normalize rating value to allowed range
 */
export function normalizeRating(value: number, count: number = 5, allowHalf: boolean = false): number {
  // Clamp value between 0 and count
  let normalized = Math.max(0, Math.min(value, count));

  // Round to nearest half if allowHalf, otherwise round to integer
  if (allowHalf) {
    normalized = Math.round(normalized * 2) / 2;
  } else {
    normalized = Math.round(normalized);
  }

  return normalized;
}

/**
 * Utility: Calculate rating from mouse position
 * Used for click/hover interactions
 */
export function calculateRatingFromPosition(
  rect: DOMRect,
  clientX: number,
  count: number,
  allowHalf: boolean
): number {
  const percent = (clientX - rect.left) / rect.width;
  const rawValue = percent * count;

  if (allowHalf) {
    // Round to nearest 0.5
    return Math.ceil(rawValue * 2) / 2;
  }

  // Round up to nearest integer
  return Math.ceil(rawValue);
}
