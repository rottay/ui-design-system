'use client';

/**
 * @deprecated Compatibility surface for the former overlay-owned Modal.
 *
 * `feedback/Modal` is the sole public owner and implementation. This module
 * preserves the historical import path without creating another engine,
 * contract or compound-component tree.
 */

export {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from '../../facade';
export type {
  ModalBodyProps,
  ModalButtonConfig,
  ModalCloseButtonProps,
  ModalConfirmProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalPlacement,
  ModalProps,
  ModalSize,
} from '../../facade';

export {
  MAX_HEIGHT_MAP,
  MODAL_DEFAULTS,
  PADDING_MAP,
  RADIUS_MAP,
  SIZE_MAP,
} from './contracts';

// Shared overlay infrastructure remains owned by primitives/runtime.
export { Portal, usePortalContainer } from '../../runtime/overlay/portal';
export type { PortalProps } from '../../runtime/overlay/portal';
export { Overlay } from '../../runtime/overlay/backdrop';
export type { OverlayProps } from '../../runtime/overlay/backdrop';
export {
  FocusTrap,
  useFocusTrap,
} from '../../runtime/overlay/focus-management/focus-trap';
export type {
  FocusTrapProps,
} from '../../runtime/overlay/focus-management/focus-trap';
