'use client';

/**
 * @fileoverview Anchor -- in-page navigation that creates links to page sections,
 * tracks scroll position, and highlights the active link. Supports nested hierarchies.
 *
 * @example
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor offsetTop={80} onChange={(key) => console.log(key)}>
 *   <Anchor.Link href="#intro" title="Introduction" />
 *   <Anchor.Link href="#features" title="Features">
 *     <Anchor.Link href="#feature-1" title="Feature 1" />
 *   </Anchor.Link>
 * </Anchor>
 * ```
 *
 * @module Anchor
 * @category Navigation
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { AnchorProps, AnchorLinkProps } from './contracts';

export {
  type AnchorProps,
  type AnchorLinkProps,
  ANCHOR_DEFAULTS,
} from './contracts';

/** @internal Base Anchor resolved via engine factory. */
const AnchorBase = createEngineComponent<AnchorProps>('Anchor', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic').then(m => ({ default: m.Anchor })),
  /** Token-driven implementation - skin-owned paint, rhythm and structure */
  modern: () => import('./engines/modern').then(m => ({ default: m.Anchor })),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Anchor })),
});

/** @internal Anchor.Link sub-component resolved via engine factory. */
const Link = createEngineComponent<AnchorLinkProps>('Anchor.Link', {
  /** Ant Design link implementation */
  classic: () => import('./engines/classic').then(m => ({ default: m.Link })),
  /** Token-driven link implementation - logical accent rail, skin-owned rhythm */
  modern: () => import('./engines/modern').then(m => ({ default: m.Link })),
  /** Vanilla HTML/CSS link implementation */
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Link })),
});

// Assemble compound component: Anchor + Anchor.Link
export const Anchor = Object.assign(AnchorBase, {
  /** Clickable link that scrolls to its target section. */
  Link,
});

export default Anchor;
