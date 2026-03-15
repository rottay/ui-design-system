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
 * - `--ds-badge-{size}-height` - Badge height per size
 * - `--ds-badge-{size}-min-width` - Minimum badge width
 * - `--ds-badge-{size}-font-size` - Text size
 * - `--ds-badge-{variant}-bg` - Background color per variant
 * - `--ds-badge-{variant}-color` - Text color per variant
 * - `--ds-badge-dot-{size}-size` - Dot indicator diameter
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

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../engines/factory';
import { useOptionalTokens } from '../../../../hooks';
import { resolveBadgePersonalityDefaults } from '../../../../personality/primitives';
import type { BadgeProps } from './Badge.types';

// Export types
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeStyle,
  BadgeStatus,
  BadgeRibbonProps,
  BadgeCountProps,
} from './Badge.types';

// Export default values and configuration maps
export {
  BADGE_DEFAULTS,
  VARIANT_COLOR_MAP,
  SIZE_MAP,
  DOT_SIZE_MAP,
  STATUS_COLOR_MAP,
} from './Badge.types';

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
const BadgeBase = createEngineComponent<BadgeProps>('Badge', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export const Badge = forwardRef<any, BadgeProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const defaults = tokens ? resolveBadgePersonalityDefaults(tokens) : null;
  const {
    radius,
    ...rest
  } = props;

  return createElement(BadgeBase, {
    ref,
    ...rest,
    radius: radius ?? defaults?.radius,
  });
});

Badge.displayName = 'Badge';
