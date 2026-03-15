'use client';

/**
 * @fileoverview ConfirmDialog - Rottay Design System
 * @description "Are you sure?" confirmation modal pattern.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The ConfirmDialog component provides a standardized confirmation dialog
 * with title, description, confirm/cancel actions, and visual variants
 * (info, warning, danger). It composes the existing Modal component internally.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Modal composition with styled confirm/cancel buttons
 * - **Modern**: DaisyUI modal with Tailwind-styled action buttons
 * - **Rustic**: Pure CSS modal with inline-styled confirmation UI
 *
 * @example Basic ConfirmDialog
 * ```tsx
 * import { ConfirmDialog } from '@rottay/design-system';
 *
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   variant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 * ```
 *
 * @module ConfirmDialog
 * @category Overlay
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { ConfirmDialogProps } from './types';

export {
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
  CONFIRM_DIALOG_DEFAULTS,
  VARIANT_COLORS,
} from './types';


export const ConfirmDialog = createEngineComponent<ConfirmDialogProps>('ConfirmDialog', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

ConfirmDialog.displayName = 'ConfirmDialog';
