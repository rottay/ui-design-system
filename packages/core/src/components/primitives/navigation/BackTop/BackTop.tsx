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

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { BackTopProps } from './BackTop.types';

export { type BackTopProps, BACKTOP_DEFAULTS } from './BackTop.types';

/** Scroll-to-top floating button resolved through the active engine. */
export const BackTop = createEngineComponent<BackTopProps>('BackTop', {
  /** Ant Design implementation - uses FloatButton.BackTop with full animations */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling with btn classes */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies, maximum control */
  rustic: () => import('./engines/rustic'),
});

export default BackTop;
