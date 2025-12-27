/**
 * Watermark Component Types
 *
 * Type definitions for the Watermark component including font configuration
 * and positioning options.
 *
 * @module WatermarkTypes
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Font configuration for watermark text.
 *
 * @example
 * ```tsx
 * const font: WatermarkFont = {
 *   color: 'rgba(0, 0, 0, 0.15)',
 *   fontSize: 16,
 *   fontWeight: 'bold',
 *   fontFamily: 'Arial',
 *   fontStyle: 'italic',
 * };
 * ```
 */
export interface WatermarkFont {
  /** Font color (supports any valid CSS color value) */
  color?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font weight (CSS font-weight values) */
  fontWeight?: 'normal' | 'light' | 'bold' | number;
  /** Font family (CSS font-family value) */
  fontFamily?: string;
  /** Font style (CSS font-style value) */
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
}

/**
 * Props for the Watermark component.
 *
 * @example
 * ```tsx
 * const props: WatermarkProps = {
 *   content: 'Confidential',
 *   rotate: -22,
 *   gap: [100, 100],
 *   font: { color: 'rgba(0, 0, 0, 0.15)' },
 * };
 * ```
 */
export interface WatermarkProps {
  /** Watermark text content (string or array of strings for multiple lines) */
  content?: string | string[];
  /** Image URL for watermark (takes precedence over content when provided) */
  image?: string;
  /** Width of each watermark unit in pixels (default: 120) */
  width?: number;
  /** Height of each watermark unit in pixels (default: 64) */
  height?: number;
  /** Rotation angle in degrees (default: -22) */
  rotate?: number;
  /** Gap between watermarks [horizontal, vertical] in pixels (default: [100, 100]) */
  gap?: [number, number];
  /** Offset from top-left [x, y] in pixels (default: [0, 0]) */
  offset?: [number, number];
  /** Z-index of the watermark overlay layer (default: 9) */
  zIndex?: number;
  /** Font configuration for text watermarks */
  font?: WatermarkFont;
  /** Whether to inherit watermark settings from parent Watermark component */
  inherit?: boolean;
  /** Content to be watermarked */
  children?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Default values for Watermark props.
 * Used when props are not explicitly provided.
 */
export const WATERMARK_DEFAULTS: Partial<WatermarkProps> = {
  rotate: -22,
  gap: [100, 100],
  offset: [0, 0],
  zIndex: 9,
  font: {
    color: 'rgba(0, 0, 0, 0.15)',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'sans-serif',
    fontStyle: 'normal',
  },
  inherit: true,
};
