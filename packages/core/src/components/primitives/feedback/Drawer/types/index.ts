/**
 * Drawer - Core Interface
 */

import type { EngineAwareProps, BaseComponentProps } from '../../../../../types';
import type { ReactNode } from 'react';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps extends BaseComponentProps, EngineAwareProps {
  /** Whether drawer is open */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Drawer placement */
  placement?: DrawerPlacement;
  /** Drawer size */
  size?: DrawerSize;
  /** Drawer title */
  title?: ReactNode;
  /** Close callback */
  onClose?: () => void;
  /** Open change callback */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show close button */
  closable?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Custom footer */
  footer?: ReactNode;
  /** Hide footer */
  hideFooter?: boolean;
  /** Children content */
  children?: ReactNode;
  /** Z-index */
  zIndex?: number;
  /** Custom width (for left/right placement) */
  width?: number | string;
  /** Custom height (for top/bottom placement) */
  height?: number | string;
  /** Show overlay/mask */
  mask?: boolean;
  /** Overlay opacity */
  maskOpacity?: number;
}

export const DRAWER_DEFAULTS: Partial<DrawerProps> = {
  placement: 'right',
  size: 'md',
  closable: true,
  closeOnOverlayClick: true,
  closeOnEscape: true,
  zIndex: 1000,
  mask: true,
  maskOpacity: 0.45,
};
