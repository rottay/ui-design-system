'use client';

/**
 * @fileoverview Badge - Notification indicator with counts, dots, and status labels.
 * Wraps child elements with a positioned count or dot overlay. Supports pulse
 * animation, multiple style variants, and standalone label mode.
 *
 * @example
 * ```tsx
 * import { Badge } from '@rottay/design-system';
 *
 * <Badge count={5} variant="primary">
 *   <Avatar src="/user.jpg" />
 * </Badge>
 *
 * <Badge dot pulse variant="error">
 *   <NotificationIcon />
 * </Badge>
 * ```
 *
 * @module Badge
 * @category Display
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../engines/factory';
import { useOptionalTokens } from '../../../../hooks';
import { resolveBadgePersonalityDefaults } from '../../../../personality/primitives';
import type { BadgeProps } from './Badge.types';

export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeStyle,
  BadgeStatus,
  BadgeRibbonProps,
  BadgeCountProps,
} from './Badge.types';

export {
  BADGE_DEFAULTS,
  VARIANT_COLOR_MAP,
  SIZE_MAP,
  DOT_SIZE_MAP,
  STATUS_COLOR_MAP,
} from './Badge.types';

/** Engine-routed base -- consumers should use the public `Badge` export below. */
const BadgeBase = createEngineComponent<BadgeProps>('Badge', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

/**
 * Badge component with personality-driven defaults.
 *
 * The forwardRef wrapper reads design tokens from context and merges
 * personality defaults (e.g. border-radius) so the badge adapts to the
 * tenant's visual tone without explicit prop overrides at every call site.
 */
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
    // Shape defaults come from personality so badges can shift tone per tenant/profile.
    radius: radius ?? defaults?.radius,
  });
});

Badge.displayName = 'Badge';
