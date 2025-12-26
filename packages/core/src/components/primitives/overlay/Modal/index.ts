/**
 * Modal - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ModalProps } from './types';
import { ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from './compound';

// Export types
export type {
  ModalProps,
  ModalSize,
  ModalPlacement,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalConfirmProps,
  ModalCloseButtonProps,
} from './types';
export { MODAL_DEFAULTS, SIZE_MAP, MAX_HEIGHT_MAP, PADDING_MAP, RADIUS_MAP } from './types';

// Export compound components
export { ModalHeader, ModalBody, ModalFooter, ModalCloseButton };

// Export utilities
export { Portal, usePortalContainer } from './utils/Portal';
export type { PortalProps } from './utils/Portal';

export { Overlay } from './utils/Overlay';
export type { OverlayProps } from './utils/Overlay';

export { FocusTrap, useFocusTrap } from './utils/FocusTrap';
export type { FocusTrapProps } from './utils/FocusTrap';

// Export base component
export { BaseModal } from './base';

// Create engine-aware Modal component
export const Modal = Object.assign(
  createEngineComponent<ModalProps>('Modal', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Header: ModalHeader,
    Body: ModalBody,
    Footer: ModalFooter,
    CloseButton: ModalCloseButton,
  }
);
