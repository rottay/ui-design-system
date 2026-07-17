'use client';

/**
 * @fileoverview Dropdown - floating action/option menu with trigger modes.
 * Supports hover, click, and contextMenu triggers; nested submenus; icons;
 * dividers; groups; keyboard navigation; and controlled/uncontrolled state.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (portal + CSS).
 *
 * @example
 * ```tsx
 * <Dropdown
 *   trigger={['click']}
 *   menu={{
 *     items: [
 *       { key: 'edit', label: 'Edit' },
 *       { key: 'delete', label: 'Delete', danger: true },
 *     ],
 *     onClick: ({ key }) => handleAction(key),
 *   }}
 * >
 *   <Button>Actions</Button>
 * </Dropdown>
 * ```
 *
 * @module Dropdown
 * @category Overlay
 */
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { DropdownProps } from './contracts';

export {
  type DropdownProps,
  type DropdownMenuItem,
  type DropdownMenuProps,
  type DropdownTrigger,
  type DropdownPlacement,
  DROPDOWN_DEFAULTS,
} from './contracts';

/**
 * Dropdown component with multi-engine support.
 * No compound sub-components -- menu structure is declared via the `menu` prop.
 */
export const Dropdown = createEngineComponent<DropdownProps>('Dropdown', {
  classic: () => import('./engines/classic'),  // Ant Design Dropdown
  modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
  rustic: () => import('./engines/rustic'),      // Portal + pure CSS
});

export default Dropdown;
