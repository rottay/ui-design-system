/**
 * @fileoverview Timeline Component Types - Rottay Design System
 * @description Type definitions, constants, and configuration for the Timeline component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides type definitions and constants for the Timeline component.
 * The Timeline displays a sequence of events or activities in chronological order,
 * with support for multiple display modes, custom icons, color coding, and
 * alternate positioning.
 *
 * **Type Categories:**
 * - `TimelineProps`: Main component props (mode, items, pending, reverse, children)
 * - `TimelineItemProps`: Individual item props (color, dot, label, position, children)
 * - `TimelineMode`: Display mode ('left' | 'right' | 'alternate')
 * - `TimelineItemColor`: Preset color options for timeline dots
 * - `TimelineItemPosition`: Override position for individual items ('left' | 'right')
 *
 * **Exported Constants:**
 * - `TIMELINE_DEFAULTS`: Default configuration values
 * - `TIMELINE_COLOR_MAP`: Color preset to CSS value mapping
 * - `TIMELINE_SIZE_MAP`: Size preset to CSS value mapping
 *
 * **Multi-Tenant Support:**
 * Timeline colors reference CSS custom properties from the design token system,
 * ensuring consistent theming across tenants.
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   TimelineProps,
 *   TimelineItemProps,
 *   TimelineMode,
 *   TimelineItemColor,
 * } from '@rottay/design-system';
 *
 * // Configure a single timeline event
 * const item: TimelineItemProps = {
 *   color: 'green',
 *   label: '2024-01-15',
 *   dot: <CheckIcon />,
 *   children: 'Task completed',
 * };
 *
 * // Configure the timeline container
 * const props: TimelineProps = {
 *   mode: 'alternate',
 *   items: [item],
 *   reverse: false,
 * };
 * ```
 *
 * @example Default Values Usage
 * ```tsx
 * import { TIMELINE_DEFAULTS, TIMELINE_COLOR_MAP } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(TIMELINE_DEFAULTS.mode);    // 'left'
 * console.log(TIMELINE_DEFAULTS.reverse); // false
 *
 * // Access color mappings
 * console.log(TIMELINE_COLOR_MAP.green);  // CSS variable for green
 * console.log(TIMELINE_COLOR_MAP.red);    // CSS variable for red
 * ```
 *
 * @see {@link TimelineProps} - Main component props
 * @see {@link TIMELINE_DEFAULTS} - Default configuration values
 * @see {@link TIMELINE_COLOR_MAP} - Color preset to CSS value mapping
 * @see {@link TIMELINE_SIZE_MAP} - Size preset to CSS value mapping
 * @module Timeline/Types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Timeline display mode.
 * - left: All items on the left side of the line
 * - right: All items on the right side of the line
 * - alternate: Items alternate between left and right sides
 */
export type TimelineMode = 'left' | 'alternate' | 'right';

/**
 * Timeline item color preset.
 */
export type TimelineItemColor = 'blue' | 'red' | 'green' | 'gray' | 'primary' | 'success' | 'warning' | 'error';

/**
 * Timeline item position for alternate mode.
 */
export type TimelineItemPosition = 'left' | 'right';

/**
 * Props for individual timeline items.
 */
export interface TimelineItemProps extends BaseComponentProps, WithChildren {
  /**
   * Custom dot element to replace the default dot.
   * Can be an icon, custom component, or any ReactNode.
   */
  dot?: ReactNode;

  /**
   * Color of the timeline dot.
   * Can be a preset color name or any valid CSS color value.
   * @default 'blue'
   */
  color?: TimelineItemColor | string;

  /**
   * Label content displayed opposite to the main content.
   * Useful for showing timestamps or metadata in alternate mode.
   */
  label?: ReactNode;

  /**
   * Position override for this item in alternate mode.
   * If not specified, position alternates automatically.
   */
  position?: TimelineItemPosition;
}

/**
 * Props for the main Timeline component.
 */
export interface TimelineProps extends BaseComponentProps, WithChildren, EngineAwareProps {
  /**
   * Display mode for the timeline.
   * - 'left': Content on left side
   * - 'right': Content on right side
   * - 'alternate': Content alternates sides
   * @default 'left'
   */
  mode?: TimelineMode;

  /**
   * Content to show as pending/loading item at the end.
   * When set, shows a loading indicator with this content.
   */
  pending?: ReactNode;

  /**
   * Custom dot element for the pending item.
   * If not specified, uses a pulsing/loading dot.
   */
  pendingDot?: ReactNode;

  /**
   * Whether to reverse the order of timeline items.
   * When true, the last item appears first.
   * @default false
   */
  reverse?: boolean;

  /**
   * Array of timeline items configuration.
   * Alternative to using Timeline.Item children.
   */
  items?: TimelineItemProps[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default values for Timeline component.
 */
export const TIMELINE_DEFAULTS = {
  /** Default display mode */
  mode: 'left' as TimelineMode,
  /** Default reverse setting */
  reverse: false,
  /** Default item color */
  itemColor: 'blue' as TimelineItemColor,
} as const;

/**
 * Color mapping for timeline dots to CSS values.
 */
export const TIMELINE_COLOR_MAP: Record<string, string> = {
  blue: 'var(--ds-color-info)',
  red: 'var(--ds-color-error)',
  green: 'var(--ds-color-success)',
  gray: 'var(--ds-color-border-secondary)',
  primary: 'var(--ds-color-primary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
};

/**
 * Size values for timeline elements using CSS variables.
 */
export const TIMELINE_SIZE_MAP = {
  dotSize: 'var(--ds-timeline-dot-size)',
  dotBorderWidth: 'var(--ds-timeline-dot-border-width)',
  lineWidth: 'var(--ds-timeline-line-width)',
  itemPadding: 'var(--ds-timeline-item-padding)',
  dotOffset: 'var(--ds-timeline-dot-offset)',
} as const;
