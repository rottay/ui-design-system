'use client';

/**
 * @fileoverview HoverCard - rich content preview that appears on mouse hover.
 * Shows a card with arbitrary ReactNode content next to a trigger element.
 * Multi-engine: Classic (Ant Design Popover), Modern (DaisyUI), Rustic (portal + delay).
 *
 * @example
 * ```tsx
 * <HoverCard
 *   content={<UserProfileCard user={user} />}
 *   trigger={<Text as="a">@username</Text>}
 *   side="bottom"
 * />
 * ```
 *
 * @module HoverCard
 * @category Overlay
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { HoverCardProps } from './HoverCard.types';

export {
  type HoverCardProps,
  type HoverCardSide,
  type HoverCardAlign,
  HOVERCARD_DEFAULTS,
} from './HoverCard.types';

/** HoverCard component with multi-engine support. No compound sub-components. */
export const HoverCard = createEngineComponent<HoverCardProps>('HoverCard', {
  classic: () => import('./engines/classic'),  // Ant Design Popover (hover trigger)
  modern: () => import('./engines/modern'),     // DaisyUI tooltip variant
  rustic: () => import('./engines/rustic'),      // Portal card + mouseenter/leave
});

HoverCard.displayName = 'HoverCard';
