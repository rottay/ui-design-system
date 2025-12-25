/**
 * Space Component Types
 *
 * Unified type definitions for Space layout.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Space size options
 */
export type SpaceSize = 'small' | 'middle' | 'large' | number;

/**
 * Space direction
 */
export type SpaceDirection = 'horizontal' | 'vertical';

/**
 * Space align options
 */
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

/**
 * Base Space props supported by all engines
 */
export interface SpaceBaseProps {
  /** Space children */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extended Space props
 */
export interface SpaceProps extends SpaceBaseProps {
  /** Gap between items */
  size?: SpaceSize | [SpaceSize, SpaceSize];
  /** Direction of items */
  direction?: SpaceDirection;
  /** Alignment of items */
  align?: SpaceAlign;
  /** Whether items should wrap */
  wrap?: boolean;
  /** Split element between items */
  split?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert size to CSS value
 */
export function getSizeValue(size?: SpaceSize): string {
  if (typeof size === 'number') return `${size}px`;

  const sizeMap: Record<string, string> = {
    small: '8px',
    middle: '16px',
    large: '24px',
  };
  return sizeMap[size ?? 'small'];
}

/**
 * Parse size to [horizontal, vertical]
 */
export function parseSpaceSize(size?: SpaceSize | [SpaceSize, SpaceSize]): [string, string] {
  if (Array.isArray(size)) {
    return [getSizeValue(size[0]), getSizeValue(size[1])];
  }
  const val = getSizeValue(size);
  return [val, val];
}

/**
 * Get align class for Tailwind
 */
export function getSpaceAlignClass(align?: SpaceAlign): string {
  const alignMap: Record<SpaceAlign, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
  };
  return align ? alignMap[align] : '';
}
