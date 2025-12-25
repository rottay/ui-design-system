/**
 * Grid Component Types (Row/Col)
 *
 * Unified type definitions for Grid layout system.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Gutter configuration
 */
export type Gutter = number | [number, number];

/**
 * Responsive breakpoint values
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Responsive gutter configuration
 */
export type ResponsiveGutter = Partial<Record<Breakpoint, number>>;

/**
 * Row justify options
 */
export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';

/**
 * Row align options
 */
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch';

/**
 * Base Row props supported by all engines
 */
export interface RowBaseProps {
  /** Row children */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extended Row props
 */
export interface RowProps extends RowBaseProps {
  /** Grid gutter spacing */
  gutter?: Gutter | ResponsiveGutter;
  /** Horizontal alignment */
  justify?: RowJustify;
  /** Vertical alignment */
  align?: RowAlign;
  /** Whether to wrap columns */
  wrap?: boolean;
}

/**
 * Column span configuration for responsive
 */
export interface ColSpanConfig {
  /** Column span */
  span?: number;
  /** Column offset */
  offset?: number;
  /** Column order */
  order?: number;
  /** Column pull */
  pull?: number;
  /** Column push */
  push?: number;
}

/**
 * Base Col props supported by all engines
 */
export interface ColBaseProps {
  /** Column children */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extended Col props
 */
export interface ColProps extends ColBaseProps {
  /** Column span (1-24, 0 = hidden) */
  span?: number;
  /** Column offset */
  offset?: number;
  /** Column order */
  order?: number;
  /** Column pull */
  pull?: number;
  /** Column push */
  push?: number;
  /** Flex property */
  flex?: string | number;
  /** xs breakpoint config */
  xs?: number | ColSpanConfig;
  /** sm breakpoint config */
  sm?: number | ColSpanConfig;
  /** md breakpoint config */
  md?: number | ColSpanConfig;
  /** lg breakpoint config */
  lg?: number | ColSpanConfig;
  /** xl breakpoint config */
  xl?: number | ColSpanConfig;
  /** xxl breakpoint config */
  xxl?: number | ColSpanConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse gutter to [horizontal, vertical]
 */
export function parseGutter(gutter?: Gutter | ResponsiveGutter): [number, number] {
  if (!gutter) return [0, 0];
  if (typeof gutter === 'number') return [gutter, 0];
  if (Array.isArray(gutter)) return gutter;
  // ResponsiveGutter - use md as default
  const g = (gutter as ResponsiveGutter).md ?? 0;
  return [g, 0];
}

/**
 * Calculate column width percentage
 */
export function getColWidth(span?: number): string {
  if (!span || span === 0) return '0';
  return `${(span / 24) * 100}%`;
}

/**
 * Get responsive span value
 */
export function getResponsiveSpan(config: number | ColSpanConfig | undefined): number | undefined {
  if (typeof config === 'number') return config;
  if (config && typeof config === 'object') return config.span;
  return undefined;
}
