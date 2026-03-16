'use client';

/**
 * @fileoverview ScrollArea -- scrollable container with custom scrollbar styling,
 * supporting vertical/horizontal orientation and hover-reveal behavior.
 *
 * @example
 * ```tsx
 * import { ScrollArea } from '@rottay/design-system';
 *
 * <ScrollArea maxHeight="300px">
 *   <p>Long scrollable content here...</p>
 * </ScrollArea>
 *
 * <ScrollArea orientation="horizontal" maxWidth="400px">
 *   <div style={{ width: '800px' }}>Wide content</div>
 * </ScrollArea>
 * ```
 *
 * @module ScrollArea
 * @category Layout
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { ScrollAreaProps } from './ScrollArea.types';

export {
  type ScrollAreaProps,
  type ScrollAreaOrientation,
  type ScrollAreaScrollbarSize,
  SCROLL_AREA_DEFAULTS,
  SCROLLBAR_SIZES,
} from './ScrollArea.types';

/** Scrollable container primitive resolved through the active engine. */
export const ScrollArea = createEngineComponent<ScrollAreaProps>('ScrollArea', {
  /** Ant Design compatible wrapper with styled scrollbar */
  classic: () => import('./engines/classic'),
  /** Tailwind CSS with utility scrollbar classes */
  modern: () => import('./engines/modern'),
  /** Pure CSS with ::-webkit-scrollbar customization */
  rustic: () => import('./engines/rustic'),
});

ScrollArea.displayName = 'ScrollArea';
