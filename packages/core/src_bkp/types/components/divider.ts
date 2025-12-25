/**
 * Divider Component Types
 *
 * Unified type definitions for Divider component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface DividerBaseProps {
  // Content
  children?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface DividerProps extends DividerBaseProps {
  // Orientation type: horizontal (default) or vertical
  type?: 'horizontal' | 'vertical';

  // Whether line is dashed
  dashed?: boolean;

  // Text alignment for horizontal dividers with content
  orientation?: 'left' | 'center' | 'right';

  // Margin on the left/right side of text (only works with orientation)
  orientationMargin?: string | number;

  // Plain text style (less padding, smaller font)
  plain?: boolean;
}
