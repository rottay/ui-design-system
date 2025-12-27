/**
 * Flex Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

export interface FlexProps {
  /** Flex direction */
  direction?: FlexDirection;
  /** Flex wrap behavior */
  wrap?: FlexWrap;
  /** Justify content alignment */
  justify?: FlexJustify;
  /** Align items alignment */
  align?: FlexAlign;
  /** Gap between items: number (px) or [horizontal, vertical] */
  gap?: number | [number, number];
  /** Flex property value */
  flex?: string | number;
  /** Use inline-flex instead of flex */
  inline?: boolean;
  /** Flex content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: 'titan' | 'hermes' | 'apollo';
}

export const FLEX_DEFAULTS: Partial<FlexProps> = {
  direction: 'row',
  wrap: 'nowrap',
  justify: 'start',
  align: 'stretch',
  inline: false,
};

/** CSS justify-content mapping */
export const FLEX_JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/** CSS align-items mapping */
export const FLEX_ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch',
};
