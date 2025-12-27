/**
 * Popconfirm Component
 *
 * A compact confirmation dialog that appears as a popover. Perfect for
 * confirming destructive actions without taking up screen space with
 * a full modal dialog. Includes customizable confirm/cancel buttons.
 *
 * @component
 * @example
 * ```tsx
 * // Basic confirmation
 * <Popconfirm
 *   title="Are you sure you want to delete this?"
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => console.log('Cancelled')}
 * >
 *   <Button danger>Delete</Button>
 * </Popconfirm>
 *
 * // With description and custom button text
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
 *
 * // With loading state
 * <Popconfirm
 *   title="Confirm action?"
 *   okButtonLoading={isDeleting}
 *   onConfirm={async () => {
 *     await deleteItem();
 *   }}
 * >
 *   <Button>Submit</Button>
 * </Popconfirm>
 *
 * // Custom placement
 * <Popconfirm title="Confirm?" placement="rightTop">
 *   <Button>Action</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link PopconfirmProps} for available props
 * @see {@link PopconfirmPlacement} for placement options
 * @see {@link PopconfirmOkType} for confirm button styles
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { PopconfirmProps } from './types';

export {
  type PopconfirmProps,
  type PopconfirmPlacement,
  type PopconfirmOkType,
  POPCONFIRM_DEFAULTS,
} from './types';

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
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Popconfirm;
