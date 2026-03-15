/**
 * @fileoverview Popconfirm Component Types - Rottay Design System
 * @description Type definitions for the Popconfirm component including placement options,
 * button configurations (type, text, loading), callback handlers, and component props.
 *
 * @remarks
 * The Popconfirm types provide comprehensive configuration for:
 * - Placement options: 12 positions around the trigger element
 * - Button types: primary, danger, or default styling
 * - Callback handlers: onConfirm (async supported), onCancel
 * - Loading states: okButtonLoading for async operations
 * - Controlled/uncontrolled state management
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   PopconfirmProps,
 *   PopconfirmPlacement,
 *   PopconfirmOkType,
 * } from '@rottay/design-system';
 *
 * const confirmProps: PopconfirmProps = {
 *   title: 'Delete this item?',
 *   description: 'This cannot be undone',
 *   okText: 'Delete',
 *   cancelText: 'Cancel',
 *   okType: 'danger',
 *   placement: 'top',
 *   onConfirm: async () => await deleteItem(),
 * };
 * ```
 *
 * @module Popconfirm/Types
 * @category Overlay
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Placement options for the popconfirm.
 * Supports 12 positions around the trigger element.
 */
export type PopconfirmPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

/**
 * Confirm button type/style options.
 * - 'primary': Standard primary action
 * - 'danger': Destructive/warning action (red)
 * - 'default': Neutral styling
 */
export type PopconfirmOkType = 'primary' | 'danger' | 'default';

/**
 * Props for the Popconfirm component.
 * A compact confirmation dialog displayed as a popover.
 *
 * @example
 * ```tsx
 * <Popconfirm
 *   title="Delete this item?"
 *   description="This action cannot be undone."
 *   okText="Delete"
 *   okType="danger"
 *   onConfirm={handleDelete}
 * >
 *   <Button danger>Delete</Button>
 * </Popconfirm>
 * ```
 */
export interface PopconfirmProps {
  /** Title of the confirmation */
  title: ReactNode;
  /** Description text */
  description?: ReactNode;
  /** Callback when confirmed */
  onConfirm?: () => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Text for confirm button */
  okText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Type of confirm button */
  okType?: PopconfirmOkType;
  /** Custom icon */
  icon?: ReactNode;
  /** Whether visible (controlled) */
  open?: boolean;
  /** Callback when visibility changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether disabled */
  disabled?: boolean;
  /** Trigger element */
  children: ReactNode;
  /** Placement */
  placement?: PopconfirmPlacement;
  /** Show arrow */
  showArrow?: boolean;
  /** Loading state for confirm button */
  okButtonLoading?: boolean;
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
 * Default values for Popconfirm component props.
 * These are applied when no explicit value is provided.
 */
export const POPCONFIRM_DEFAULTS: Partial<PopconfirmProps> = {
  /** Default confirm button text */
  okText: 'Yes',
  /** Default cancel button text */
  cancelText: 'No',
  /** Default confirm button type */
  okType: 'primary',
  /** Default placement */
  placement: 'top',
  /** Show arrow by default */
  showArrow: true,
  /** Not disabled by default */
  disabled: false,
  /** Confirm button not loading by default */
  okButtonLoading: false,
};
