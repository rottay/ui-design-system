'use client';

/**
 * @fileoverview ConfirmDialog - "Are you sure?" modal with onConfirm/onCancel callbacks.
 * Variants: info, warning, danger. Composes the Modal component internally.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={show}
 *   variant="danger"
 *   title="Delete Item"
 *   description="This cannot be undone."
 *   onConfirm={handleDelete}
 *   onCancel={() => setShow(false)}
 * />
 * ```
 *
 * @module ConfirmDialog
 * @category Overlay
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { ConfirmDialogProps } from './ConfirmDialog.types';

export {
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
  CONFIRM_DIALOG_DEFAULTS,
  VARIANT_COLORS,
} from './ConfirmDialog.types';

/**
 * ConfirmDialog component with multi-engine support.
 * No compound sub-components -- title/description/variant props control layout.
 */
export const ConfirmDialog = createEngineComponent<ConfirmDialogProps>('ConfirmDialog', {
  classic: () => import('./engines/classic'),  // Ant Design Modal composition
  modern: () => import('./engines/modern'),     // DaisyUI modal
  rustic: () => import('./engines/rustic'),      // Pure CSS modal
});

ConfirmDialog.displayName = 'ConfirmDialog';
