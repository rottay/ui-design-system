'use client';

/**
 * @fileoverview Badge - Rottay Design System
 * @description Notification indicator with counts, dots, and status labels.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Badge component displays counts, status indicators, or labels that
 * can be positioned over other elements or used standalone.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Badge with animation and ribbon support
 * - **Modern**: DaisyUI indicator classes with Tailwind utilities
 * - **Rustic**: Pure CSS implementation with zero dependencies
 *
 * **Key Features:**
 * - Numeric counts with overflow (e.g., "99+")
 * - Dot indicators for simple notifications
 * - Pulse animation for attention
 * - Multiple positioning options (top-right, top-left, etc.)
 * - Style variants (solid, outline, soft, ghost)
 * - Icon support with closable option
 *
 * **CSS Custom Properties:**
 * - `--badge-{size}-height` - Badge height per size
 * - `--badge-{size}-min-width` - Minimum badge width
 * - `--badge-{size}-font-size` - Text size
 * - `--badge-{variant}-bg` - Background color per variant
 * - `--badge-{variant}-color` - Text color per variant
 * - `--badge-dot-{size}-size` - Dot indicator diameter
 *
 * @example Basic Usage with Count
 * ```tsx
 * import { Badge } from '@rottay/design-system';
 *
 * <Badge count={5} variant="primary">
 *   <Avatar src="/user.jpg" />
 * </Badge>
 * ```
 *
 * @example Standalone Badge
 * ```tsx
 * <Badge content="New" variant="success" />
 * <Badge content="Hot" variant="error" badgeStyle="soft" />
 * ```
 *
 * @example Dot Indicator with Pulse
 * ```tsx
 * <Badge dot pulse variant="error">
 *   <NotificationIcon />
 * </Badge>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Badge engine="modern" count={10}>
 *   <MailIcon />
 * </Badge>
 * ```
 *
 * @see {@link BadgeProps} for available props
 * @see {@link Avatar} for common pairing
 * @module Badge
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { BadgeProps } from './types';

// Export types
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeStyle,
  BadgeStatus,
  BadgeRibbonProps,
  BadgeCountProps,
} from './types';

// Export default values and configuration maps
export {
  BADGE_DEFAULTS,
  VARIANT_COLOR_MAP,
  SIZE_MAP,
  DOT_SIZE_MAP,
  STATUS_COLOR_MAP,
} from './types';

// Export base component for direct access

/**
 * Badge component with automatic engine selection.
 *
 * This component uses the design system's engine factory to dynamically
 * load the appropriate implementation based on the current engine context
 * (Classic/Ant Design, Modern/DaisyUI, or Rustic/Pure CSS).
 *
 * @component
 * @see {@link BadgeProps} for available props
 */
export const Badge = createEngineComponent<BadgeProps>('Badge', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
