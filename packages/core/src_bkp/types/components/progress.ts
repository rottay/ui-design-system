/**
 * Progress Component Types
 *
 * Unified type definitions for Progress component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Progress type variants
 */
export type ProgressType = 'line' | 'circle';

/**
 * Progress status variants
 */
export type ProgressStatus = 'success' | 'exception' | 'normal' | 'active';

/**
 * Progress size variants
 */
export type ProgressSize = 'small' | 'default';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface ProgressBaseProps {
  // Progress value (0-100)
  percent?: number;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Display
  showInfo?: boolean;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface ProgressProps extends ProgressBaseProps {
  // Type of progress (line or circle)
  type?: ProgressType;

  // Status variant
  status?: ProgressStatus;

  // Stroke color (can be string or object for gradient)
  strokeColor?: string | { from: string; to: string; direction?: string };

  // Trail (background) color
  trailColor?: string;

  // Stroke width (thickness of the progress bar)
  strokeWidth?: number;

  // Size preset
  size?: ProgressSize;

  // Custom format function for percentage display
  format?: (percent?: number) => ReactNode;

  // Children to display instead of default percentage
  children?: ReactNode;
}

/**
 * Type guard to check if strokeColor is a gradient
 */
export function isGradientColor(
  color?: string | { from: string; to: string; direction?: string }
): color is { from: string; to: string; direction?: string } {
  return typeof color === 'object' && 'from' in color && 'to' in color;
}
