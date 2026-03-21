'use client';

/**
 * @fileoverview Modal - overlay dialog with focus trap and scroll prevention.
 * Compound sub-components: Header, Body, Footer, CloseButton.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={handleClose} size="md">
 *   <Modal.Header onClose={handleClose}>Edit Profile</Modal.Header>
 *   <Modal.Body><ProfileForm /></Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @module Modal
 * @category Feedback
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { ModalProps } from './Modal.types';
import { ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from './compound';

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
} from './Modal.types';

export { MODAL_DEFAULTS, PADDING_MAP } from './Modal.types';

export { ModalHeader, ModalBody, ModalFooter, ModalCloseButton };

/**
 * Modal component with multi-engine support.
 * Supports multiple sizes (sm-full), focus trapping, scroll prevention,
 * and flexible content layouts via compound sub-components.
 */
export const Modal = Object.assign(
  // Create the engine-switchable base component
  createEngineComponent<ModalProps>('Modal', {
    classic: () => import('./engines/classic'),  // Ant Design
    modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
    rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
  }),
  // Attach compound sub-components (Modal.Header, .Body, .Footer, .CloseButton)
  {
    /** Title bar with optional close button and divider. */
    Header: ModalHeader,
    /** Scrollable content area with configurable padding. */
    Body: ModalBody,
    /** Action-button row with alignment options. */
    Footer: ModalFooter,
    /** Standalone close trigger for custom header layouts. */
    CloseButton: ModalCloseButton,
  }
);
