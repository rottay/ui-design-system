'use client';

/**
 * @fileoverview Sheet overlay runtime -- a thin Sheet-facing adapter over the
 * shared overlay layer-stack manager. The engines' call sites stay unchanged
 * (`const { isTopmost } = useSheetOverlayRuntime(active)`), while stack order and
 * the body scroll lock are now owned by the canonical, LIFO-safe refcount
 * instead of a Sheet-local stack. `restoreFocus` is disabled here because the
 * Sheet engines already run a FocusTrap that restores focus. The modern engine
 * passes its presence-gated `shouldRender` so the lock and stack registration
 * survive the exit animation; rustic passes `open` directly.
 */

import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';

/** Coordinates Sheet stack order and body scroll lock via the layer manager. */
export function useSheetOverlayRuntime(open: boolean): { isTopmost: () => boolean } {
  const layer = useOverlayLayer({ kind: 'sheet', active: open, restoreFocus: false });
  return { isTopmost: layer.isTopMost };
}
