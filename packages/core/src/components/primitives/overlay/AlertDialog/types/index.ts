/**
 * @fileoverview AlertDialog Types - Rottay Design System
 * @description Type definitions for the AlertDialog component.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants for the
 * AlertDialog component. These types are shared across all engine implementations.
 *
 * The AlertDialog differs from ConfirmDialog by using an action slot pattern
 * instead of onConfirm/onCancel callbacks. The consumer provides a fully
 * configured action button as a ReactNode, giving full control over the
 * destructive action's appearance and behavior.
 *
 * @module AlertDialogTypes
 * @category Overlay
 * @package @rottay/design-system
 */

import type { EngineAwareProps } from '../../../../../types';
import type { ReactNode, CSSProperties } from 'react';

export interface AlertDialogProps extends EngineAwareProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes (close on cancel, backdrop click, escape) */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title */
  title?: ReactNode;
  /** Dialog description/body text */
  description?: ReactNode;
  /** Action element (e.g., a destructive Button). Rendered as the primary action. */
  action?: ReactNode;
  /** Cancel button label */
  cancelLabel?: string;
  /** Whether to close the dialog when the backdrop is clicked */
  closeOnBackdropClick?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Data test id */
  'data-testid'?: string;
}

export const ALERT_DIALOG_DEFAULTS = {
  cancelLabel: 'Cancel',
  closeOnBackdropClick: false,
};
