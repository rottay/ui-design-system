/**
 * Modal Component
 *
 * A flexible modal dialog component for displaying overlay content.
 * Supports multiple sizes, placements, backdrop options, and includes
 * compound components for structured content organization.
 *
 * @component
 * @example
 * ```tsx
 * // Basic modal
 * <Modal open={isOpen} onClose={() => setIsOpen(false)}>
 *   <Modal.Header>Title</Modal.Header>
 *   <Modal.Body>Content goes here</Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={() => setIsOpen(false)}>Close</Button>
 *   </Modal.Footer>
 * </Modal>
 *
 * // Simple modal with title prop
 * <Modal open={isOpen} onClose={handleClose} title="Confirmation">
 *   Are you sure you want to proceed?
 * </Modal>
 *
 * // Full-screen modal
 * <Modal open={isOpen} onClose={handleClose} fullScreen>
 *   <Modal.Body>Full screen content</Modal.Body>
 * </Modal>
 *
 * // Modal with blur backdrop
 * <Modal open={isOpen} onClose={handleClose} blurBackdrop>
 *   <Modal.Body>Content with blurred background</Modal.Body>
 * </Modal>
 * ```
 *
 * @see {@link ModalProps} for available props
 * @see {@link ModalHeaderProps} for header configuration
 * @see {@link ModalBodyProps} for body configuration
 * @see {@link ModalFooterProps} for footer configuration
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

/**
 * Modal component with multi-engine support.
 * Displays overlay dialogs with focus trapping and scroll prevention.
 *
 * @param props - Modal configuration props
 * @param props.open - Whether the modal is visible
 * @param props.onClose - Callback when the modal should close
 * @param props.size - Modal width size ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full')
 * @param props.title - Modal title text
 * @param props.placement - Modal position ('center' | 'top' | 'bottom')
 * @param props.closable - Whether to show the close button
 * @param props.closeOnBackdropClick - Whether clicking backdrop closes modal
 * @param props.closeOnEscape - Whether ESC key closes modal
 * @returns The rendered Modal component
 */
export const Modal = Object.assign(
  createEngineComponent<ModalProps>('Modal', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /** Compound component for the modal header section */
    Header: ModalHeader,
    /** Compound component for the modal body/content section */
    Body: ModalBody,
    /** Compound component for the modal footer/actions section */
    Footer: ModalFooter,
    /** Compound component for a custom close button */
    CloseButton: ModalCloseButton,
  }
);
