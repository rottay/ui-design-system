'use client';

/**
 * @fileoverview Sheet - mobile-first sliding panel (bottom/side).
 * Semantically different from Drawer: optimized for touch interactions
 * with drag handle and snap points.
 * Multi-engine: Classic (Ant Design Drawer variant), Modern (DaisyUI), Rustic (portal + slide).
 *
 * @example
 * ```tsx
 * <Sheet open={open} onOpenChange={setOpen} side="bottom" title="Details">
 *   <p>Sheet content</p>
 * </Sheet>
 * ```
 *
 * @module Sheet
 * @category Overlay
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { SheetProps } from './contracts';

export {
  type SheetProps,
  type SheetSide,
  SHEET_DEFAULTS,
} from './contracts';

/** Sheet component with multi-engine support. No compound sub-components. */
export const Sheet = createEngineComponent<SheetProps>('Sheet', {
  classic: () => import('./engines/classic'),  // Ant Design Drawer variant
  modern: () => import('./engines/modern'),     // DaisyUI drawer + Tailwind transitions
  rustic: () => import('./engines/rustic'),      // Portal + slide animation + drag handle
});

Sheet.displayName = 'Sheet';
