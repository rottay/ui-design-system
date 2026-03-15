'use client';

/**
 * @fileoverview ContextMenu - Rottay Design System
 * @description Right-click triggered context menu for contextual actions.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The ContextMenu component provides a right-click triggered floating menu.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design Dropdown with trigger='contextMenu'
 * - **Modern**: DaisyUI dropdown with right-click handler
 * - **Rustic**: Portal menu with contextmenu event listener
 *
 * @example Basic Usage
 * ```tsx
 * import { ContextMenu } from '@rottay/design-system';
 *
 * <ContextMenu
 *   items={[
 *     { key: 'copy', label: 'Copy' },
 *     { key: 'paste', label: 'Paste' },
 *     { key: 'delete', label: 'Delete', danger: true },
 *   ]}
 *   onSelect={(key) => console.log('Selected:', key)}
 *   trigger={<div style={{ padding: 40, background: 'var(--ds-color-neutral-100)' }}>Right-click me</div>}
 * />
 * ```
 *
 * @module ContextMenu
 * @category Overlay
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { ContextMenuProps } from './ContextMenu.types';

export {
  type ContextMenuProps,
  type ContextMenuItem,
  CONTEXTMENU_DEFAULTS,
} from './ContextMenu.types';

export const ContextMenu = createEngineComponent<ContextMenuProps>('ContextMenu', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

ContextMenu.displayName = 'ContextMenu';
