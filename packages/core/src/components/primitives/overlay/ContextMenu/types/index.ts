/**
 * @fileoverview ContextMenu Types - Rottay Design System
 * @description Type definitions for the ContextMenu component.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @module ContextMenu/Types
 * @category Overlay
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../../types';

/**
 * A single item in the context menu.
 */
export interface ContextMenuItem {
  /** Unique key for the item */
  key: string;
  /** Display label */
  label: ReactNode;
  /** Optional icon before the label */
  icon?: ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether to style as a destructive action */
  danger?: boolean;
  /** Item type: normal item, divider, or group header */
  type?: 'item' | 'divider' | 'group';
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Nested children for sub-menus */
  children?: ContextMenuItem[];
  /** Click handler for this item */
  onClick?: () => void;
}

/**
 * Props for the ContextMenu component.
 * A right-click triggered menu for contextual actions.
 */
export interface ContextMenuProps extends EngineAwareProps {
  /** Menu items to display */
  items: ContextMenuItem[];
  /** Callback when a menu item is selected */
  onSelect?: (key: string) => void;
  /** The trigger element that responds to right-click */
  trigger: ReactNode;
  /** Whether the context menu is disabled */
  disabled?: boolean;
  /** Additional class for the menu overlay */
  overlayClassName?: string;
  /** Additional styles for the menu overlay */
  overlayStyle?: CSSProperties;
}

/**
 * Default values for ContextMenu component props.
 */
export const CONTEXTMENU_DEFAULTS = {
  disabled: false,
};
