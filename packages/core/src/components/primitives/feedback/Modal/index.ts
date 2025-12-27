/**
 * Modal Component
 *
 * A flexible modal dialog component for displaying overlay content.
 * Supports multiple sizes, placements, and includes compound components
 * for structured content organization.
 *
 * @component
 * @example
 * ```tsx
 * // Basic modal with compound components
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
 * ```
 *
 * @see {@link ModalProps} for available props
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
export { MODAL_DEFAULTS, PADDING_MAP } from './types';

// Export compound components
export { ModalHeader, ModalBody, ModalFooter, ModalCloseButton };

// Export base component
export { BaseModal } from './base';

/**
 * Modal component with multi-engine support.
 * Displays overlay dialogs with focus trapping and scroll prevention.
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
