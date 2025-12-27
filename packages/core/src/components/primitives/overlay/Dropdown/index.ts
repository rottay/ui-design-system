/**
 * Dropdown Component
 *
 * A floating menu component that displays a list of actions or options.
 * Supports hover, click, and context menu triggers with customizable
 * placement and menu item configurations.
 *
 * @component
 * @example
 * ```tsx
 * // Basic dropdown with hover trigger
 * <Dropdown
 *   menu={{
 *     items: [
 *       { key: '1', label: 'Edit' },
 *       { key: '2', label: 'Delete', danger: true },
 *     ],
 *     onClick: ({ key }) => console.log(key),
 *   }}
 * >
 *   <Button>Actions</Button>
 * </Dropdown>
 *
 * // Dropdown with click trigger
 * <Dropdown
 *   trigger={['click']}
 *   menu={{
 *     items: [
 *       { key: 'profile', label: 'Profile', icon: <UserIcon /> },
 *       { key: 'settings', label: 'Settings', icon: <SettingsIcon /> },
 *       { type: 'divider', key: 'd1' },
 *       { key: 'logout', label: 'Logout' },
 *     ],
 *   }}
 * >
 *   <Avatar src="/user.jpg" />
 * </Dropdown>
 *
 * // Context menu
 * <Dropdown
 *   trigger={['contextMenu']}
 *   menu={{ items: [{ key: 'copy', label: 'Copy' }] }}
 * >
 *   <div>Right-click me</div>
 * </Dropdown>
 * ```
 *
 * @see {@link DropdownProps} for available props
 * @see {@link DropdownMenuItem} for menu item configuration
 * @see {@link DropdownMenuProps} for menu configuration
 */
import { createEngineComponent } from '../../../../system/engines/factory';
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
