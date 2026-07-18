'use client';

/**
 * @fileoverview Sheet overlay runtime -- a thin Sheet-facing adapter over the
 * shared overlay layer-stack manager. The engines' call sites stay unchanged
 * (`const { isTopmost } = useSheetOverlayRuntime(open)`), while stack order and
 * the body scroll lock are now owned by the canonical, LIFO-safe refcount
 * instead of a Sheet-local stack. `restoreFocus` is disabled here because the
 * Sheet engines already run a FocusTrap that restores focus.
 */

import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';

/** Coordinates Sheet stack order and body scroll lock via the layer manager. */
export function useSheetOverlayRuntime(open: boolean): { isTopmost: () => boolean } {
  const layer = useOverlayLayer({ kind: 'sheet', active: open, restoreFocus: false });
  return { isTopmost: layer.isTopMost };
}
