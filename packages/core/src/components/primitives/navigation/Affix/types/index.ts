/**
 * Affix Component Types
 * Makes an element stick to viewport when scrolling
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineName } from '../../../../../types';

/**
 * Props for the Affix component
 * @description Makes elements stick to the viewport when scrolling past a threshold
 */
export interface AffixProps {
  /**
   * Pixels from top of viewport to trigger affix
   * @default 0
   */
  offsetTop?: number;

  /**
   * Pixels from bottom of viewport to trigger affix
   * When set, offsetTop is ignored
   */
  offsetBottom?: number;

  /**
   * Target container to listen for scroll events
   * @default () => window
   */
  target?: () => Window | HTMLElement | null;

  /**
   * Callback when affixed state changes
   * @param affixed - Whether the element is currently affixed
   */
  onChange?: (affixed: boolean) => void;

  /**
   * Content to be made sticky
   */
  children: ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: CSSProperties;

  /**
   * Override the default rendering engine
   * @default Inherited from EngineProvider or 'titan'
   */
  engine?: EngineName;

  /**
   * z-index for the affixed element
   * @default 10
   */
  zIndex?: number;
}

/**
 * Internal state for affix calculations
 */
export interface AffixState {
  /** Whether the element is currently affixed */
  affixed: boolean;
  /** Fixed position styles when affixed */
  fixedStyle?: CSSProperties;
  /** Placeholder dimensions */
  placeholderStyle?: CSSProperties;
}

/**
 * Default values for Affix props
 */
export const AFFIX_DEFAULTS = {
  /** Default offset from top in pixels */
  offsetTop: 0,
  /** Default z-index when affixed */
  zIndex: 10,
} as const;
