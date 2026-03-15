'use client';

/**
 * @fileoverview AlertDialog - Rottay Design System
 * @description Confirmation dialog with destructive action emphasis and action slot pattern.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The AlertDialog component provides a modal dialog for actions that require
 * explicit user confirmation, typically destructive operations. Unlike ConfirmDialog
 * which uses onConfirm/onCancel callbacks, AlertDialog uses an action slot pattern
 * where the consumer provides a fully configured action button as a ReactNode.
 *
 * By default, clicking the backdrop does NOT close the dialog, ensuring the user
 * must make an explicit choice.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Modal composition with action slot
 * - **Modern**: DaisyUI modal with action slot
 * - **Rustic**: Pure CSS modal with action slot
 *
 * @example Basic AlertDialog
 * ```tsx
 * import { AlertDialog, Button } from '@rottay/design-system';
 *
 * <AlertDialog
 *   open={showAlert}
 *   onOpenChange={setShowAlert}
 *   title="Delete Account"
 *   description="This will permanently delete your account and all associated data."
 *   action={
 *     <Button variant="destructive" onClick={handleDelete}>
 *       Delete Account
 *     </Button>
 *   }
 * />
 * ```
 *
 * @module AlertDialog
 * @category Overlay
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { AlertDialogProps } from './types';

export {
  type AlertDialogProps,
  ALERT_DIALOG_DEFAULTS,
} from './types';


export const AlertDialog = createEngineComponent<AlertDialogProps>('AlertDialog', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

AlertDialog.displayName = 'AlertDialog';
