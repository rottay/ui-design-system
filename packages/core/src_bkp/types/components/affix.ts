/**
 * Affix Component Types
 *
 * Unified type definitions for Affix component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface AffixBaseProps {
  // Content to affix
  children: ReactNode;

  // Offset from top of viewport (when affixing to top)
  offsetTop?: number;

  // Offset from bottom of viewport (when affixing to bottom)
  offsetBottom?: number;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Callback when affix state changes
  onChange?: (affixed: boolean) => void;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface AffixProps extends AffixBaseProps {
  // Target container to listen for scroll events (default: window)
  target?: () => HTMLElement | Window | null;

  // Z-index for affixed element
  zIndex?: number;
}
