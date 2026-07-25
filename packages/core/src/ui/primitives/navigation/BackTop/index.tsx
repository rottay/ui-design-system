'use client';

/**
 * @fileoverview BackTop -- floating button that appears after scrolling past a
 * threshold and smoothly scrolls the page back to the top when clicked.
 *
 * @example
 * ```tsx
 * import { BackTop } from '@rottay/design-system';
 *
 * // Appears after 200px of scroll
 * <BackTop visibilityHeight={200} onClick={() => console.log('scrolled!')} />
 *
 * // Inside a custom scroll container
 * const ref = useRef<HTMLDivElement>(null);
 * <BackTop target={() => ref.current!} />
 * ```
 *
 * @module BackTop
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { BackTopProps } from './contracts';

export { type BackTopProps, BACKTOP_DEFAULTS } from './contracts';

/** Scroll-to-top floating button resolved through the active engine. */
export const BackTop = createEngineComponent<BackTopProps>('BackTop', {
  /** Ant Design implementation - uses FloatButton.BackTop with full animations */
  classic: () => import('./engines/classic'),
  /** Token-driven implementation - skin-owned chrome and interaction states */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies, maximum control */
  rustic: () => import('./engines/rustic'),
});

export default BackTop;
