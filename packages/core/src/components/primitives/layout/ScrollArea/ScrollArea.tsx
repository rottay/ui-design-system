'use client';

/**
 * @fileoverview ScrollArea - Rottay Design System
 * @description Container with custom styled scrollbar for overflow content.
 * Part of the Rottay Design System's layout primitives collection.
 *
 * @remarks
 * The ScrollArea component provides a scrollable container with customizable
 * scrollbar styling. It supports vertical, horizontal, or both scroll directions,
 * adjustable scrollbar thickness, and hover-reveal behavior.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design compatible wrapper with styled scrollbar
 * - **Modern**: Tailwind CSS implementation with utility scrollbar classes
 * - **Rustic**: Pure CSS with ::-webkit-scrollbar styling
 *
 * @example Basic ScrollArea
 * ```tsx
 * import { ScrollArea } from '@rottay/design-system';
 *
 * <ScrollArea maxHeight="300px">
 *   <p>Long scrollable content here...</p>
 * </ScrollArea>
 * ```
 *
 * @example Horizontal Scroll
 * ```tsx
 * <ScrollArea orientation="horizontal" maxWidth="400px">
 *   <div style={{ width: '800px' }}>Wide content</div>
 * </ScrollArea>
 * ```
 *
 * @module ScrollArea
 * @category Layout
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { ScrollAreaProps } from './ScrollArea.types';

export {
  type ScrollAreaProps,
  type ScrollAreaOrientation,
  type ScrollAreaScrollbarSize,
  SCROLL_AREA_DEFAULTS,
  SCROLLBAR_SIZES,
} from './ScrollArea.types';


export const ScrollArea = createEngineComponent<ScrollAreaProps>('ScrollArea', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

ScrollArea.displayName = 'ScrollArea';
