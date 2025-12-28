/**
 * @fileoverview Splitter Component Types - Rottay Design System
 * @description Type definitions for the Splitter compound component including
 * props for the main Splitter container and Splitter.Panel sub-component.
 *
 * @remarks
 * The Splitter types support:
 * - Horizontal and vertical split layouts
 * - Panel size constraints (min, max, default)
 * - Collapsible and resizable panel options
 * - Resize event callbacks
 *
 * @example Type Usage
 * ```tsx
 * import type { SplitterProps, SplitterPanelProps } from '@rottay/design-system';
 *
 * const splitterConfig: SplitterProps = {
 *   layout: 'horizontal',
 *   onResize: (sizes) => console.log(sizes),
 *   onResizeEnd: (sizes) => saveSizes(sizes),
 * };
 *
 * const panelConfig: SplitterPanelProps = {
 *   defaultSize: 30,
 *   min: 100,
 *   max: 500,
 *   collapsible: true,
 * };
 * ```
 *
 * @module Splitter/Types
 * @category Layout
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Supported rendering engines for Splitter components.
 */
type SplitterEngine = 'titan' | 'hermes' | 'apollo';

/**
 * Props for the Splitter.Panel sub-component.
 * Defines size constraints and behavior for individual panels.
 *
 * @interface SplitterPanelProps
 * @example
 * ```tsx
 * <Splitter.Panel
 *   defaultSize={25}
 *   min={100}
 *   max={400}
 *   collapsible
 * >
 *   Panel content
 * </Splitter.Panel>
 * ```
 */
export interface SplitterPanelProps {
  /**
   * Default size of the panel.
   * Number is treated as percentage (0-100).
   * String can be percentage or pixel value.
   */
  defaultSize?: number | string;

  /**
   * Minimum size the panel can be resized to.
   * Number is treated as pixels.
   */
  min?: number | string;

  /**
   * Maximum size the panel can be resized to.
   * Number is treated as pixels.
   */
  max?: number | string;

  /**
   * Whether the panel can be collapsed to zero width/height.
   * @default false
   */
  collapsible?: boolean;

  /**
   * Whether the panel can be resized.
   * Set to false to create a fixed-size panel.
   * @default true
   */
  resizable?: boolean;

  /** Panel content. */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /** Rendering engine override. */
  engine?: SplitterEngine;
}

/**
 * Props for the main Splitter container component.
 * Controls layout direction and resize event handling.
 *
 * @interface SplitterProps
 * @example
 * ```tsx
 * <Splitter
 *   layout="horizontal"
 *   onResize={(sizes) => console.log('Resizing:', sizes)}
 *   onResizeEnd={(sizes) => saveSizes(sizes)}
 * >
 *   <Splitter.Panel>Panel 1</Splitter.Panel>
 *   <Splitter.Panel>Panel 2</Splitter.Panel>
 * </Splitter>
 * ```
 */
export interface SplitterProps {
  /**
   * Split direction.
   * - `horizontal`: Panels arranged left-to-right
   * - `vertical`: Panels arranged top-to-bottom
   * @default 'horizontal'
   */
  layout?: 'horizontal' | 'vertical';

  /**
   * Callback fired continuously during resize.
   * Receives array of panel sizes as percentages.
   * @param sizes - Array of panel sizes (percentages)
   */
  onResize?: (sizes: number[]) => void;

  /**
   * Callback fired when resize operation begins.
   */
  onResizeStart?: () => void;

  /**
   * Callback fired when resize operation completes.
   * Receives final array of panel sizes as percentages.
   * @param sizes - Array of final panel sizes (percentages)
   */
  onResizeEnd?: (sizes: number[]) => void;

  /** Splitter.Panel children. */
  children?: ReactNode;

  /** Additional CSS class names. */
  className?: string;

  /** Inline CSS styles. */
  style?: CSSProperties;

  /** Rendering engine override. */
  engine?: SplitterEngine;
}

/**
 * Default values for Splitter component props.
 * Used when props are not explicitly provided.
 */
export const SPLITTER_DEFAULTS = {
  /** Default split direction. */
  layout: 'horizontal' as const,
  /** Default gutter size in pixels. */
  gutterSize: 8,
  /** Default minimum panel size. */
  minSize: 0,
};
