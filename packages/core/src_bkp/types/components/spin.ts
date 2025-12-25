/**
 * Spin Component Types
 *
 * Unified type definitions for Spin component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode, ReactElement } from 'react';

/**
 * Custom indicator type for Spin component
 * Compatible with AntD's SpinIndicator type
 */
export type SpinIndicator = ReactElement<HTMLElement>;

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface SpinBaseProps {
  // Loading state
  spinning?: boolean;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Content
  children?: ReactNode;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface SpinProps extends SpinBaseProps {
  // Size variants (all engines support)
  size?: 'small' | 'default' | 'large';

  // Loading tip text (titan primary support)
  tip?: ReactNode;

  // Delay showing spinner in milliseconds (titan, apollo support)
  delay?: number;

  // Custom indicator element (titan, apollo support)
  indicator?: SpinIndicator;

  // Fullscreen mode (titan primary support, apollo partial)
  fullscreen?: boolean;

  // Wrapper props for container (when wrapping children)
  wrapperClassName?: string;
}

/**
 * Type guard to check if spin is actively spinning
 */
export function isSpinning(props: SpinProps): boolean {
  return props.spinning ?? true;
}

/**
 * Type guard to check if spin is wrapping content
 */
export function isWrappingContent(props: SpinProps): boolean {
  return props.children !== undefined;
}
