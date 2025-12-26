/**
 * Dropdown Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';
export type DropdownPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

export interface DropdownMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: DropdownMenuItem[];
  type?: 'item' | 'divider' | 'group';
  onClick?: () => void;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  onClick?: (info: { key: string }) => void;
  selectedKeys?: string[];
  selectable?: boolean;
}

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

export const DROPDOWN_DEFAULTS: Partial<DropdownProps> = {
  trigger: ['hover'],
  placement: 'bottomLeft',
  disabled: false,
  arrow: false,
  destroyPopupOnHide: false,
  autoAdjustOverflow: true,
};
