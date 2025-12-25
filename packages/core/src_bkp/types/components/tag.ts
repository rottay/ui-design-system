/**
 * Tag Component Types
 *
 * Unified type definitions for Tag component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface TagBaseProps {
  // Content
  children?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Color/variant
  color?: string;

  // Interaction
  closable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;

  // Visual elements
  icon?: ReactNode;
  bordered?: boolean;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface TagProps extends TagBaseProps {
  // Additional properties that some engines support
  closeIcon?: ReactNode;

  // Accessibility
  id?: string;
  'aria-label'?: string;
}
