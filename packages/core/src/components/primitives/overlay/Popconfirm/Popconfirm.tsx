'use client';

/**
 * @fileoverview Popconfirm Component - Rottay Design System
 * @description A compact confirmation dialog that appears as a popover. Perfect for
 * confirming destructive actions without taking up screen space with a full modal dialog.
 * Includes customizable confirm/cancel buttons with loading states and danger styling.
 *
 * @remarks
 * The Popconfirm component provides an inline confirmation experience that's less
 * intrusive than a full modal. It's ideal for:
 * - Delete confirmations for items in lists or tables
 * - Form submission confirmations
 * - Dangerous action warnings
 * - Quick yes/no decisions
 * - Inline workflow approvals
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Async support**: onConfirm can return a Promise with loading state
 * - **Button customization**: Text, type (primary/danger/default), and loading
 * - **12 placement positions**: All sides with alignment variants
 * - **Description support**: Additional context below the title
 * - **Custom icons**: Warning, question, or custom icons
 *
 * @example Basic confirmation dialog
 * ```tsx
 * import { Popconfirm, Button } from '@rottay/design-system';
 *
 * <Popconfirm
 *   title="Are you sure you want to delete this?"
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => console.log('Cancelled')}
 * >
 *   <Button danger>Delete</Button>
 * </Popconfirm>
 * ```
 *
 * @example With description and custom button text
 * ```tsx
 * <Popconfirm
 *   title="Delete Item"
 *   description="This action cannot be undone."
 *   okText="Delete"
 *   cancelText="Keep"
 *   okType="danger"
 *   onConfirm={handleDelete}
 * >
 *   <Button>Remove</Button>
 * </Popconfirm>
 * ```
 *
 * @example Async confirmation with loading state
 * ```tsx
 * <Popconfirm
 *   title="Confirm action?"
 *   okButtonLoading={isDeleting}
 *   onConfirm={async () => {
 *     await deleteItem();
 *   }}
 * >
 *   <Button>Submit</Button>
 * </Popconfirm>
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <Popconfirm engine="classic" title="Confirm?" okType="danger">
 *   <Button>Classic Confirm</Button>
 * </Popconfirm>
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <Popconfirm engine="modern" title="Confirm?" okType="primary">
 *   <Button>Modern Confirm</Button>
 * </Popconfirm>
 *
 * // Rustic engine (Pure HTML/CSS)
 * <Popconfirm engine="rustic" title="Confirm?" placement="bottom">
 *   <Button>Rustic Confirm</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link PopconfirmProps} for available props
 * @see {@link PopconfirmPlacement} for placement options
 * @see {@link PopconfirmOkType} for confirm button styles
 * @see {@link Modal} for full-screen confirmation dialogs
 * @module Popconfirm
 * @category Overlay
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
import type { PopconfirmProps } from './Popconfirm.types';

export {
  type PopconfirmProps,
  type PopconfirmPlacement,
  type PopconfirmOkType,
  POPCONFIRM_DEFAULTS,
} from './Popconfirm.types';

/**
 * Popconfirm component with multi-engine support.
 * Displays a compact confirmation dialog as a popover.
 *
 * @param props - Popconfirm configuration props
 * @param props.title - Confirmation message/title
 * @param props.description - Additional description text
 * @param props.onConfirm - Callback when confirmed
 * @param props.onCancel - Callback when cancelled
 * @param props.okText - Confirm button text
 * @param props.cancelText - Cancel button text
 * @param props.okType - Confirm button style ('primary' | 'danger' | 'default')
 * @param props.placement - Position of the popconfirm
 * @param props.children - The trigger element
 * @returns The rendered Popconfirm component
 */
export const Popconfirm = createEngineComponent<PopconfirmProps>('Popconfirm', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

export default Popconfirm;
