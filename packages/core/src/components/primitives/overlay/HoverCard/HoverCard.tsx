'use client';

/**
 * @fileoverview HoverCard - Rottay Design System
 * @description Card that appears on hover over a trigger element.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The HoverCard component provides rich content previews on hover.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design Popover with hover trigger
 * - **Modern**: DaisyUI tooltip-like with card content
 * - **Rustic**: Portal card with mouse enter/leave + delay
 *
 * @example Basic Usage
 * ```tsx
 * import { HoverCard } from '@rottay/design-system';
 *
 * <HoverCard
 *   content={<div>Profile card content here</div>}
 *   trigger={<span style={{ textDecoration: 'underline' }}>Hover me</span>}
 *   side="bottom"
 * />
 * ```
 *
 * @module HoverCard
 * @category Overlay
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { HoverCardProps } from './HoverCard.types';

export {
  type HoverCardProps,
  type HoverCardSide,
  type HoverCardAlign,
  HOVERCARD_DEFAULTS,
} from './HoverCard.types';

export const HoverCard = createEngineComponent<HoverCardProps>('HoverCard', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

HoverCard.displayName = 'HoverCard';
