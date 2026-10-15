/**
 * @fileoverview Wraps a content region's own element in the DS ancestor
 * `<Suspense>` when the shipped placement includes that region.
 *
 * The fallback is the region element itself, rendered empty: it keeps the
 * element's tag, class and `data-part`, so the slot's skin box rules apply to
 * it while the boundary waits or is client-rendered after a server error.
 * Whether that holds real-content geometry is measured by the joint matrix.
 * It drops `id` and `tabIndex`, so an outlined boundary never puts a second
 * landmark target or focus stop in the document beside its hidden content.
 *
 * With the region inactive the element is returned as it was given: no
 * wrapper, no component layer and no hook, so the render is unchanged.
 *
 * @module Components/Structures/Foundation/ContentBoundary/Region
 */

import { cloneElement, Suspense, type ReactElement } from 'react';

import { activeContentBoundaryRegions, type ContentBoundaryRegion } from '../policy';

export function withContentBoundary(region: ContentBoundaryRegion, slot: ReactElement): ReactElement {
  if (!activeContentBoundaryRegions().includes(region)) return slot;

  const fallback = cloneElement(
    slot as ReactElement<Record<string, unknown>>,
    { id: undefined, tabIndex: undefined, 'aria-busy': true, 'data-content-fallback': region },
    null,
  );

  return <Suspense fallback={fallback}>{slot}</Suspense>;
}
