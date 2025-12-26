/**
 * Space Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type SpaceSize = 'small' | 'middle' | 'large';
export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

export interface SpaceProps {
  /** Size of spacing: preset or number (px) or [horizontal, vertical] */
  size?: SpaceSize | number | [number, number];
  /** Direction of spacing */
  direction?: SpaceDirection;
  /** Whether to wrap items */
  wrap?: boolean;
  /** Alignment of items */
  align?: SpaceAlign;
  /** Element to render between items */
  split?: ReactNode;
  /** Space content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export const SPACE_DEFAULTS: Partial<SpaceProps> = {
  size: 'small',
  direction: 'horizontal',
  wrap: false,
  align: 'center',
};

/** Size values in pixels */
export const SPACE_SIZE_MAP: Record<SpaceSize, number> = {
  small: 8,
  middle: 16,
  large: 24,
};

/** CSS align-items mapping */
export const SPACE_ALIGN_MAP: Record<SpaceAlign, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
};
