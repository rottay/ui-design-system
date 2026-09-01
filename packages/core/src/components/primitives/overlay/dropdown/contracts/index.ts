/**
 * @fileoverview Dropdown Component Types - Rottay Design System
 * @description Type definitions for the Dropdown component including trigger types,
 * placement options, menu item configuration, and component props.
 *
 * @remarks
 * The Dropdown types support:
 * - Multiple trigger modes (click, hover, contextMenu)
 * - Six placement positions
 * - Menu item types (item, divider, group)
 * - Nested submenu configuration
 * - Controlled and uncontrolled state
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   DropdownProps,
 *   DropdownMenuItem,
 *   DropdownMenuProps,
 * } from '@rottay/design-system';
 *
 * const menuItems: DropdownMenuItem[] = [
 *   { key: 'edit', label: 'Edit', icon: <EditIcon /> },
 *   { type: 'divider', key: 'd1' },
 *   { key: 'delete', label: 'Delete', danger: true },
 * ];
 * ```
 *
 * @module Dropdown/Types
 * @category Overlay
 * @package @rottay/design-system
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
/** A separator rule. It renders as a bare `role="separator"` and carries no
 *  content, so it takes no `label`, `icon` or handler. */
export interface DropdownMenuDivider {
  /** Unique identifier for the divider */
  key: string;
  type: 'divider';
}

/** A selectable entry or a titled group. Both render content, so both label. */
export interface DropdownMenuEntry {
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
  /** Type of menu item ('item' or 'group'); defaults to 'item' */
  type?: 'item' | 'group';
  /** Click handler for the menu item */
  onClick?: () => void;
}

/**
 * A dropdown entry, discriminated on `type`.
 *
 * A divider has no content — the engines return `<li role="separator" />` and
 * never read `label` — so requiring one made the separator shape in this
 * module's own usage example impossible to express.
 */
export type DropdownMenuItem = DropdownMenuEntry | DropdownMenuDivider;

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
  /** Container for the dropdown popup (prevents positioning issues in scrollable containers) */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
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
  /** Auto-adjust position to stay in viewport */
  autoAdjustOverflow: true,
};
