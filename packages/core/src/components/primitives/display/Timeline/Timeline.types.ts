/**
 * @fileoverview Timeline Component Types - Rottay Design System
 * @description Type definitions for the Timeline component including display modes,
 * item configuration, color presets, and position options.
 *
 * @remarks
 * The Timeline types provide comprehensive configuration for:
 * - Display modes: left, right, or alternate positioning
 * - Item props: dot, color, label, position, children
 * - Color presets: blue, red, green, gray, and semantic colors
 * - Pending state: Loading indicator configuration
 * - Reverse order: Newest items first
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
 * const item: TimelineItemProps = {
 *   color: 'green',
 *   label: '2024-01-15',
 *   dot: <CheckIcon />,
 *   children: 'Task completed',
 * };
 *
 * const props: TimelineProps = {
 *   mode: 'alternate',
 *   items: [item],
 *   reverse: false,
 * };
 * ```
 *
 * @module Timeline/Types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  TimelineProps,
  TimelineItemProps,
  TimelineMode,
  TimelineItemColor,
  TimelineItemPosition,
} from '../../../../contracts/primitives/display/Timeline';

export {
  TIMELINE_DEFAULTS,
  TIMELINE_COLOR_MAP,
  TIMELINE_SIZE_MAP,
} from '../../../../contracts/primitives/display/Timeline';
