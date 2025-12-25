/**
 * Empty Component Types
 *
 * Unified type definitions for Empty component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface EmptyBaseProps {
  // Content
  description?: ReactNode;
  children?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface EmptyProps extends EmptyBaseProps {
  // Custom image (titan primary support, apollo/hermes can use ReactNode)
  image?: ReactNode;

  // Image style (titan primary support)
  imageStyle?: CSSProperties;
}
