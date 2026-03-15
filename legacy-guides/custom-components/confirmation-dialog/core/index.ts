import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type ConfirmationDialogPreset = 'standard' | 'destructive';

export interface ConfirmationDialogProps extends EngineAwareProps {
  preset?: ConfirmationDialogPreset;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** If provided, user must type this exact text to enable confirm button */
  confirmText?: string;
  /** Placeholder for the confirmation input */
  confirmPlaceholder?: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CONFIRMATION_DIALOG_DEFAULTS: Partial<ConfirmationDialogProps> = {
  preset: 'standard',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmPlaceholder: 'Type to confirm',
};
