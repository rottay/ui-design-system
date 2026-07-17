'use client';

/**
 * @fileoverview AlertDialog - confirmation dialog for destructive actions.
 * Uses an action-slot pattern (ReactNode) instead of onConfirm callbacks.
 * Backdrop click does NOT close the dialog -- the user must make an explicit choice.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <AlertDialog
 *   open={show}
 *   onOpenChange={setShow}
 *   title="Delete Account"
 *   description="This action is permanent."
 *   action={<Button variant="destructive" onClick={handleDelete}>Delete</Button>}
 * />
 * ```
 *
 * @module AlertDialog
 * @category Overlay
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { AlertDialogProps } from './contracts';

export {
  type AlertDialogProps,
  ALERT_DIALOG_DEFAULTS,
} from './contracts';

/**
 * AlertDialog component with multi-engine support.
 * No compound sub-components -- layout is driven by title/description/action props.
 */
export const AlertDialog = createEngineComponent<AlertDialogProps>('AlertDialog', {
  classic: () => import('./engines/classic'),  // Ant Design Modal composition
  modern: () => import('./engines/modern'),     // DaisyUI modal
  rustic: () => import('./engines/rustic'),      // Pure CSS modal
});

AlertDialog.displayName = 'AlertDialog';
