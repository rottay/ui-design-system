'use client';

/**
 * @fileoverview Sheet - Rottay Design System
 * @description Bottom/side sheet component for mobile-first layouts.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The Sheet component provides a sliding panel, semantically different from Drawer.
 * Optimized for mobile-first interactions with drag handle and snap points.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design Drawer variant
 * - **Modern**: DaisyUI drawer with Tailwind transitions
 * - **Rustic**: Portal + slide animation + drag-to-close handle
 *
 * @example Basic Usage
 * ```tsx
 * import { Sheet } from '@rottay/design-system';
 *
 * const [open, setOpen] = useState(false);
 *
 * <Sheet open={open} onOpenChange={setOpen} side="bottom" title="Details">
 *   <p>Sheet content here</p>
 * </Sheet>
 * ```
 *
 * @module Sheet
 * @category Overlay
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { SheetProps } from './Sheet.types';

export {
  type SheetProps,
  type SheetSide,
  SHEET_DEFAULTS,
} from './Sheet.types';

export const Sheet = createEngineComponent<SheetProps>('Sheet', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

Sheet.displayName = 'Sheet';
