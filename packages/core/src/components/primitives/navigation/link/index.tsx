'use client';

/**
 * @fileoverview NavLink -- styled anchor element with semantic color types, external
 * link handling (auto target="_blank"), underline control, and disabled state.
 *
 * @remarks
 * Published as `NavLink`. `Typography.Link` is a separate compound owned by
 * the Typography primitive (`primitives/display/typography/compound/link`);
 * this module must never declare or export a competing `Link`.
 *
 * @example
 * ```tsx
 * import { NavLink } from '@rottay/design-system';
 *
 * <NavLink href="/docs" type="primary">Documentation</NavLink>
 * <NavLink href="https://github.com" external>GitHub</NavLink>
 * <NavLink href="/restricted" disabled>Locked</NavLink>
 * ```
 *
 * @module NavLink
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { LinkProps } from './contracts';

export type { LinkProps, LinkType } from './contracts';
export { LINK_DEFAULTS, LINK_TYPE_COLORS } from './contracts';

/** Styled anchor primitive resolved through the active engine. */
export const NavLink = createEngineComponent<LinkProps>('NavLink', {
  /** Ant Design implementation - uses Typography.Link with full Ant styling */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first with DaisyUI link classes */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies, pure inline styles */
  rustic: () => import('./engines/rustic'),
});
