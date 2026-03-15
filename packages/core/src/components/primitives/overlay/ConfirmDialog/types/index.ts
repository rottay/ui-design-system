/**
 * @fileoverview ConfirmDialog Types - Rottay Design System
 * @description Type definitions for the ConfirmDialog component.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * ConfirmDialog component. These types are shared across all engine implementations.
 *
 * @module ConfirmDialogTypes
 * @category Overlay
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, CSSProperties } from 'react';

export type ConfirmDialogVariant = 'info' | 'warning' | 'danger';

export interface ConfirmDialogProps extends EngineAwareProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Dialog title */
  title?: ReactNode;
  /** Dialog description/body text */
  description?: ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Callback when confirmed */
  onConfirm?: () => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Visual variant affecting color and icon */
  variant?: ConfirmDialogVariant;
  /** Custom icon to display */
  icon?: ReactNode;
  /** Whether the confirm action is loading */
  loading?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Data test id */
  'data-testid'?: string;
}

export const VARIANT_COLORS: Record<ConfirmDialogVariant, { icon: string; button: string; bg: string }> = {
  info: {
    icon: 'var(--ds-color-primary-500, #1890ff)',
    button: 'var(--ds-color-primary-500, #1890ff)',
    bg: 'var(--ds-color-primary-50, #e6f7ff)',
  },
  warning: {
    icon: 'var(--ds-color-warning-500, #faad14)',
    button: 'var(--ds-color-warning-500, #faad14)',
    bg: 'var(--ds-color-warning-50, #fffbe6)',
  },
  danger: {
    icon: 'var(--ds-color-error-500, #ff4d4f)',
    button: 'var(--ds-color-error-500, #ff4d4f)',
    bg: 'var(--ds-color-error-50, #fff2f0)',
  },
};

export const CONFIRM_DIALOG_DEFAULTS = {
  variant: 'info' as ConfirmDialogVariant,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  loading: false,
};
