/**
 * Watermark Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface WatermarkFont {
  /** Font color */
  color?: string;
  /** Font size */
  fontSize?: number;
  /** Font weight */
  fontWeight?: 'normal' | 'light' | 'bold' | number;
  /** Font family */
  fontFamily?: string;
  /** Font style */
  fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
}

export interface WatermarkProps {
  /** Watermark text content (string or array of strings for multiple lines) */
  content?: string | string[];
  /** Image URL for watermark (takes precedence over content) */
  image?: string;
  /** Width of the watermark */
  width?: number;
  /** Height of the watermark */
  height?: number;
  /** Rotation angle in degrees */
  rotate?: number;
  /** Gap between watermarks [horizontal, vertical] */
  gap?: [number, number];
  /** Offset from top-left [x, y] */
  offset?: [number, number];
  /** Z-index of the watermark layer */
  zIndex?: number;
  /** Font settings */
  font?: WatermarkFont;
  /** Whether to inherit from parent */
  inherit?: boolean;
  /** Children to wrap */
  children?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
}

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
