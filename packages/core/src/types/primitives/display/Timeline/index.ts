import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

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
  blue: '#1890ff',
  red: '#ff4d4f',
  green: '#52c41a',
  gray: '#d9d9d9',
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

/**
 * Size values for timeline elements (in pixels).
 */
export const TIMELINE_SIZE_MAP = {
  dotSize: 12,
  dotBorderWidth: 2,
  lineWidth: 2,
  itemPadding: 20,
  dotOffset: 24,
} as const;
