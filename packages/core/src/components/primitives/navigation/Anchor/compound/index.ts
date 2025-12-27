/**
 * Anchor - Compound Components
 *
 * This module exports the compound components used by the Anchor component.
 * The Link component is the primary compound component for creating anchor links.
 */

'use client';

import { createEngineComponent } from '../../../../../system/engines/factory';
import type { AnchorLinkProps } from '../types';

/**
 * AnchorLink - Compound component for creating navigation links within an Anchor
 *
 * @example
 * ```tsx
 * <Anchor>
 *   <AnchorLink href="#section1" title="Section 1" />
 *   <AnchorLink href="#section2" title="Section 2">
 *     <AnchorLink href="#section2-1" title="Subsection 2.1" />
 *   </AnchorLink>
 * </Anchor>
 * ```
 */
export const AnchorLink = createEngineComponent<AnchorLinkProps>('Anchor.Link', {
  titan: () => import('../engines/titan').then(m => ({ default: m.Link })),
  hermes: () => import('../engines/hermes').then(m => ({ default: m.Link })),
  apollo: () => import('../engines/apollo').then(m => ({ default: m.Link })),
});

export type { AnchorLinkProps };
