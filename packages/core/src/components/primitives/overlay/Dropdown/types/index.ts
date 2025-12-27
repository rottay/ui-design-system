/**
 * Dropdown Component Types
 *
 * Type definitions for the Dropdown component including trigger types,
 * placement options, menu item configuration, and component props.
 *
 * @module DropdownTypes
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Trigger methods for opening the dropdown.
 * - 'click': Opens on click
 * - 'hover': Opens on mouse hover
 * - 'contextMenu': Opens on right-click
 */
export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';

/**
 * Placement options for the dropdown menu.
 * Determines where the menu appears relative to the trigger element.
 */
export type DropdownPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

/**
 * Configuration for a single menu item in the dropdown.
 *
 * @example
 * ```tsx
 * const item: DropdownMenuItem = {
 *   key: 'edit',
 *   label: 'Edit',
 *   icon: <EditIcon />,
 *   onClick: () => handleEdit(),
 * };
 * ```
 */
export interface DropdownMenuItem {
  /** Unique identifier for the menu item */
  key: string;
  /** Display content for the menu item */
  label: ReactNode;
  /** Optional icon displayed before the label */
  icon?: ReactNode;
  /** Whether the menu item is disabled */
  disabled?: boolean;
  /** Whether to style the item as dangerous/destructive */
  danger?: boolean;
  /** Nested menu items for sub-menus */
  children?: DropdownMenuItem[];
  /** Type of menu item ('item', 'divider', or 'group') */
  type?: 'item' | 'divider' | 'group';
  /** Click handler for the menu item */
  onClick?: () => void;
}

/**
 * Configuration for the dropdown menu.
 * Contains the list of items and selection behavior.
 */
export interface DropdownMenuProps {
  /** Array of menu items to display */
  items: DropdownMenuItem[];
  /** Callback when any menu item is clicked */
  onClick?: (info: { key: string }) => void;
  /** Currently selected item keys (for selectable menus) */
  selectedKeys?: string[];
  /** Whether menu items are selectable */
  selectable?: boolean;
}

/**
 * Props for the Dropdown component.
 * A floating menu that appears on user interaction.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   menu={{
 *     items: [
 *       { key: 'edit', label: 'Edit' },
 *       { key: 'delete', label: 'Delete', danger: true },
 *     ],
 *   }}
 *   trigger={['click']}
 * >
 *   <Button>Actions</Button>
 * </Dropdown>
 * ```
 */
export interface DropdownProps {
  /** Menu configuration */
  menu?: DropdownMenuProps;
  /** Trigger method */
  trigger?: DropdownTrigger | DropdownTrigger[];
  /** Placement of the dropdown */
  placement?: DropdownPlacement;
  /** Whether the dropdown is open (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** The trigger element */
  children: ReactNode;
  /** Arrow pointing to trigger */
  arrow?: boolean | { pointAtCenter: boolean };
  /** Destroy popup when hidden */
  destroyPopupOnHide?: boolean;
  /** Auto adjust popup position */
  autoAdjustOverflow?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Overlay class name */
  overlayClassName?: string;
  /** Overlay styles */
  overlayStyle?: CSSProperties;
}

/**
 * Default values for Dropdown component props.
 * These are applied when no explicit value is provided.
 */
export const DROPDOWN_DEFAULTS: Partial<DropdownProps> = {
  /** Default trigger method */
  trigger: ['hover'],
  /** Default placement */
  placement: 'bottomLeft',
  /** Not disabled by default */
  disabled: false,
  /** No arrow by default */
  arrow: false,
  /** Keep popup mounted when hidden */
  destroyPopupOnHide: false,
  /** Auto-adjust position to stay in viewport */
  autoAdjustOverflow: true,
};
