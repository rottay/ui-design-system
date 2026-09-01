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
import type { EngineAwareProps } from '../../../../../foundation/contracts';

/**
 * A single item in the context menu.
 */
/** A separator rule: renders as a bare divider and carries no content. */
export interface ContextMenuDivider {
  /** Unique key for the divider */
  key: string;
  type: 'divider';
}

/** A selectable entry or a titled group — both render content, both label. */
export interface ContextMenuEntry {
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
  /** Item type: normal item or group header; defaults to 'item' */
  type?: 'item' | 'group';
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Nested children for sub-menus */
  children?: ContextMenuItem[];
  /** Click handler for this item */
  onClick?: () => void;
}

/**
 * A context-menu entry, discriminated on `type`. Same shape as
 * `DropdownMenuItem`: a divider renders no content, so it takes no label.
 */
export type ContextMenuItem = ContextMenuEntry | ContextMenuDivider;

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
