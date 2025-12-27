/**
 * Splitter Types
 */
import type { ReactNode, CSSProperties } from 'react';

/** Engine type for splitter components */
type SplitterEngine = 'titan' | 'hermes' | 'apollo';

export interface SplitterPanelProps {
  /** Default size (percentage or pixels) */
  defaultSize?: number | string;
  /** Minimum size */
  min?: number | string;
  /** Maximum size */
  max?: number | string;
  /** Whether panel is collapsible */
  collapsible?: boolean;
  /** Whether panel is resizable */
  resizable?: boolean;
  /** Panel content */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: SplitterEngine;
}

export interface SplitterProps {
  /** Split direction */
  layout?: 'horizontal' | 'vertical';
  /** Called when panel sizes change */
  onResize?: (sizes: number[]) => void;
  /** Called when resize starts */
  onResizeStart?: () => void;
  /** Called when resize ends */
  onResizeEnd?: (sizes: number[]) => void;
  /** Panel children */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: SplitterEngine;
}

export const SPLITTER_DEFAULTS = {
  layout: 'horizontal' as const,
  gutterSize: 8,
  minSize: 0,
};
