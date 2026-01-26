'use client';

/**
 * @fileoverview Dropdown Component - Rottay Design System
 * @description A floating menu component that displays a list of actions or options.
 * Supports hover, click, and context menu triggers with customizable placement,
 * nested submenus, and menu item configurations including icons, dividers, and groups.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The Dropdown component provides:
 * - Multiple trigger modes (hover, click, contextMenu)
 * - Six placement positions (top, topLeft, topRight, bottom, bottomLeft, bottomRight)
 * - Menu item types (item, divider, group)
 * - Nested submenus via children property
 * - Danger/destructive item styling
 * - Disabled items
 * - Icons per item
 * - Controlled and uncontrolled open state
 *
 * Key features:
 * - Click-outside dismissal
 * - Keyboard navigation support
 * - Arrow pointing to trigger (optional)
 * - Auto-adjust overflow positioning
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Titan**: Wraps Ant Design Dropdown with full feature parity
 * - **Hermes**: Tailwind CSS/DaisyUI dropdown implementation
 * - **Apollo**: Pure CSS dropdown with portal rendering
 *
 * @example Basic Dropdown with Hover Trigger
 * ```tsx
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * <Dropdown
 *   menu={{
 *     items: [
 *       { key: 'edit', label: 'Edit' },
 *       { key: 'duplicate', label: 'Duplicate' },
 *       { key: 'delete', label: 'Delete', danger: true },
 *     ],
 *     onClick: ({ key }) => console.log('Selected:', key),
 *   }}
 * >
 *   <Button>Actions</Button>
 * </Dropdown>
 * ```
 *
 * @example Click Trigger with Icons
 * ```tsx
 * import { Dropdown, Avatar } from '@rottay/design-system';
 * import { UserIcon, SettingsIcon, LogoutIcon } from './icons';
 *
 * <Dropdown
 *   trigger={['click']}
 *   menu={{
 *     items: [
 *       { key: 'profile', label: 'Profile', icon: <UserIcon /> },
 *       { key: 'settings', label: 'Settings', icon: <SettingsIcon /> },
 *       { type: 'divider', key: 'd1' },
 *       { key: 'logout', label: 'Logout', icon: <LogoutIcon /> },
 *     ],
 *   }}
 * >
 *   <Avatar src="/user.jpg" />
 * </Dropdown>
 * ```
 *
 * @example Context Menu
 * ```tsx
 * import { Dropdown } from '@rottay/design-system';
 *
 * <Dropdown
 *   trigger={['contextMenu']}
 *   menu={{
 *     items: [
 *       { key: 'copy', label: 'Copy' },
 *       { key: 'paste', label: 'Paste' },
 *       { key: 'cut', label: 'Cut' },
 *     ],
 *   }}
 * >
 *   <div style={{ padding: 20, background: '#f0f0f0' }}>
 *     Right-click me
 *   </div>
 * </Dropdown>
 * ```
 *
 * @example Controlled Open State
 * ```tsx
 * import { useState } from 'react';
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * function ControlledDropdown() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <Dropdown
 *       open={open}
 *       onOpenChange={setOpen}
 *       trigger={['click']}
 *       menu={{ items: [{ key: '1', label: 'Option 1' }] }}
 *     >
 *       <Button>Toggle Menu</Button>
 *     </Dropdown>
 *   );
 * }
 * ```
 *
 * @example Placement Options
 * ```tsx
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * <Dropdown
 *   placement="topRight"
 *   menu={{ items: [{ key: '1', label: 'Opens above' }] }}
 * >
 *   <Button>Top Right</Button>
 * </Dropdown>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Dropdown, Button } from '@rottay/design-system';
 *
 * // Force Hermes (Tailwind) implementation
 * <Dropdown
 *   engine="hermes"
 *   trigger={['click']}
 *   menu={{ items: [{ key: '1', label: 'Tailwind styled' }] }}
 * >
 *   <Button>DaisyUI Dropdown</Button>
 * </Dropdown>
 * ```
 *
 * @see {@link Popover} - For custom content overlays
 * @see {@link Modal} - For full dialog overlays
 * @see {@link Menu} - For navigation menus
 *
 * @see {@link DropdownProps} for available props
 * @see {@link DropdownMenuItem} for menu item configuration
 * @see {@link DropdownMenuProps} for menu configuration
 *
 * @module Dropdown
 * @category Overlay
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { DropdownProps } from './types';

export {
  type DropdownProps,
  type DropdownMenuItem,
  type DropdownMenuProps,
  type DropdownTrigger,
  type DropdownPlacement,
  DROPDOWN_DEFAULTS,
} from './types';

/**
 * Dropdown component with multi-engine support.
 * Displays floating menus triggered by user interaction.
 *
 * @param props - Dropdown configuration props
 * @param props.menu - Menu configuration with items and click handler
 * @param props.trigger - How to trigger the dropdown ('click' | 'hover' | 'contextMenu')
 * @param props.placement - Position of the dropdown relative to trigger
 * @param props.open - Controlled open state
 * @param props.onOpenChange - Callback when open state changes
 * @param props.disabled - Whether the dropdown is disabled
 * @param props.arrow - Whether to show arrow pointing to trigger
 * @param props.children - The trigger element
 * @returns The rendered Dropdown component
 */
export const Dropdown = createEngineComponent<DropdownProps>('Dropdown', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Dropdown;
