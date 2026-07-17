'use client';

/**
 * @fileoverview Popconfirm - compact confirmation popover for inline destructive actions.
 * Less intrusive than a full modal. Supports async onConfirm with loading state,
 * 12 placement positions, description text, and custom button labels/types.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
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
 *
 * @module Popconfirm
 * @category Overlay
 */
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { PopconfirmProps } from './contracts';

export {
  type PopconfirmProps,
  type PopconfirmPlacement,
  type PopconfirmOkType,
  POPCONFIRM_DEFAULTS,
} from './contracts';

/** Popconfirm component with multi-engine support. No compound sub-components. */
export const Popconfirm = createEngineComponent<PopconfirmProps>('Popconfirm', {
  classic: () => import('./engines/classic'),  // Ant Design Popconfirm
  modern: () => import('./engines/modern'),     // DaisyUI popover + confirm UI
  rustic: () => import('./engines/rustic'),      // Portal popover + inline buttons
});

export default Popconfirm;
