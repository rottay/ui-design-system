/**
 * Badge Component Types
 *
 * Unified type definitions for Badge component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Badge status types for predefined color schemes
 */
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

/**
 * Badge size variants
 */
export type BadgeSize = 'small' | 'default';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface BadgeBaseProps {
  // Content
  children?: ReactNode;
  text?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Color
  color?: string;
  status?: BadgeStatus;

  // Accessibility
  title?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface BadgeProps extends BadgeBaseProps {
  // Count mode (numeric badges)
  count?: ReactNode;
  showZero?: boolean;
  overflowCount?: number;

  // Dot mode (indicator only, no count)
  dot?: boolean;

  // Size
  size?: BadgeSize;

  // Positioning offset [x, y] (titan primary support)
  offset?: [number, number];
}

/**
 * Helper type guard to check if badge is in count mode
 */
export function isBadgeCountMode(props: BadgeProps): boolean {
  return props.count !== undefined || props.showZero === true;
}

/**
 * Helper type guard to check if badge is in dot mode
 */
export function isBadgeDotMode(props: BadgeProps): boolean {
  return props.dot === true;
}

/**
 * Helper to get the display count based on overflow settings
 */
export function getDisplayCount(count: number, overflowCount: number = 99): string {
  return count > overflowCount ? `${overflowCount}+` : String(count);
}

/**
 * Status color mappings for consistent theming
 */
export const STATUS_COLORS = {
  success: '#52c41a',
  processing: '#1890ff',
  default: '#d9d9d9',
  error: '#ff4d4f',
  warning: '#faad14',
} as const;
