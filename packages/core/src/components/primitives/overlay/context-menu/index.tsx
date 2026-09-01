'use client';

/**
 * @fileoverview ContextMenu - right-click triggered floating menu.
 * Accepts an items array and a trigger element; opens on `contextmenu` event.
 * Multi-engine: Classic (Ant Design Dropdown), Modern (DaisyUI), Rustic (Portal menu).
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   items={[{ key: 'copy', label: 'Copy' }, { key: 'delete', label: 'Delete', danger: true }]}
 *   onSelect={(key) => handleAction(key)}
 *   trigger={<div>Right-click me</div>}
 * />
 * ```
 *
 * @module ContextMenu
 * @category Overlay
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ContextMenuProps } from './contracts';

export {
  type ContextMenuProps,
  type ContextMenuItem,
  CONTEXTMENU_DEFAULTS,
} from './contracts';

/** ContextMenu component with multi-engine support. No compound sub-components. */
export const ContextMenu = createEngineComponent<ContextMenuProps>('ContextMenu', {
  classic: () => import('./engines/classic'),  // Ant Design Dropdown (contextMenu trigger)
  modern: () => import('./engines/modern'),     // DaisyUI dropdown + right-click handler
  rustic: () => import('./engines/rustic'),      // Portal menu + contextmenu listener
});

ContextMenu.displayName = 'ContextMenu';
