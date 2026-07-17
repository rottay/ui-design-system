'use client';

/**
 * @fileoverview Link -- styled anchor element with semantic color types, external
 * link handling (auto target="_blank"), underline control, and disabled state.
 *
 * @example
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * <Link href="/docs" type="primary">Documentation</Link>
 * <Link href="https://github.com" external>GitHub</Link>
 * <Link href="/restricted" disabled>Locked</Link>
 * ```
 *
 * @module Link
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { LinkProps } from './contracts';

export type { LinkProps, LinkType } from './contracts';
export { LINK_DEFAULTS, LINK_TYPE_COLORS } from './contracts';

/** Styled anchor primitive resolved through the active engine. */
export const Link = createEngineComponent<LinkProps>('Link', {
  /** Ant Design implementation - uses Typography.Link with full Ant styling */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first with DaisyUI link classes */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies, pure inline styles */
  rustic: () => import('./engines/rustic'),
});
