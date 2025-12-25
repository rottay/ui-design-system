import { ReactNode } from 'react';

export type ScrollShadowOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollShadowSize = 'sm' | 'md' | 'lg';
export type ScrollShadowVisibility = 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'both';

export interface ScrollShadowProps {
  /**
   * Content to wrap with scroll shadows
   */
  children: ReactNode;

  /**
   * Scroll orientation
   * @default 'vertical'
   */
  orientation?: ScrollShadowOrientation;

  /**
   * Shadow size
   * @default 'md'
   */
  size?: ScrollShadowSize;

  /**
   * Control shadow visibility
   * @default 'auto'
   */
  visibility?: ScrollShadowVisibility;

  /**
   * Hide scrollbar
   * @default false
   */
  hideScrollBar?: boolean;

  /**
   * Offset from edges (px)
   * @default 0
   */
  offset?: number;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * Callback when scroll position changes
   */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}
