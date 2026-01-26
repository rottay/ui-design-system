'use client';

/**
 * @fileoverview Modal (Overlay) Component - Rottay Design System
 * @description A flexible modal dialog component for displaying overlay content.
 * Supports multiple sizes, placements, backdrop options, focus trapping,
 * and includes compound components for structured content organization.
 * Part of the Rottay Design System's overlay primitives collection.
 *
 * @remarks
 * The Modal (Overlay) component provides:
 * - Multiple size presets (xs to full)
 * - Center, top, and bottom placements
 * - Focus trapping for accessibility
 * - Scroll prevention when open
 * - Backdrop click and ESC key dismissal
 * - Blur backdrop option
 * - Full-screen mode
 *
 * Key features:
 * - Compound components (Modal.Header, Modal.Body, Modal.Footer, Modal.CloseButton)
 * - Portal rendering to document body
 * - Controlled open/close state
 * - Smooth enter/exit animations
 *
 * This component supports the Rottay multi-engine architecture:
 * - **Titan**: Wraps Ant Design Modal with full feature parity
 * - **Hermes**: Tailwind CSS/DaisyUI modal implementation
 * - **Apollo**: Pure CSS modal with inline styles
 *
 * @example Basic Modal
 * ```tsx
 * import { useState } from 'react';
 * import { Modal, Button } from '@rottay/design-system';
 *
 * function Example() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
 *       <Modal open={isOpen} onClose={() => setIsOpen(false)}>
 *         <Modal.Header>Title</Modal.Header>
 *         <Modal.Body>Content goes here</Modal.Body>
 *         <Modal.Footer>
 *           <Button onClick={() => setIsOpen(false)}>Close</Button>
 *         </Modal.Footer>
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Simple Modal with Title Prop
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal open={isOpen} onClose={handleClose} title="Confirmation">
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 *
 * @example Full-Screen Modal
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal open={isOpen} onClose={handleClose} fullScreen>
 *   <Modal.Body>Full screen content</Modal.Body>
 * </Modal>
 * ```
 *
 * @example Modal with Blur Backdrop
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * <Modal open={isOpen} onClose={handleClose} blurBackdrop>
 *   <Modal.Body>Content with blurred background</Modal.Body>
 * </Modal>
 * ```
 *
 * @example Size Variants
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * // Extra small modal
 * <Modal open={isOpen} onClose={handleClose} size="xs">
 *   <Modal.Body>Compact dialog</Modal.Body>
 * </Modal>
 *
 * // Large modal
 * <Modal open={isOpen} onClose={handleClose} size="lg">
 *   <Modal.Body>Spacious content area</Modal.Body>
 * </Modal>
 * ```
 *
 * @example Placement Options
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * // Top-aligned modal
 * <Modal open={isOpen} onClose={handleClose} placement="top">
 *   <Modal.Body>Appears at top of screen</Modal.Body>
 * </Modal>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * // Force Hermes (Tailwind) implementation
 * <Modal engine="hermes" open={isOpen} onClose={handleClose}>
 *   <Modal.Header>Tailwind Modal</Modal.Header>
 *   <Modal.Body>DaisyUI styled content</Modal.Body>
 * </Modal>
 * ```
 *
 * @see {@link Drawer} - For slide-in panel overlays
 * @see {@link Popover} - For smaller contextual overlays
 * @see {@link Dropdown} - For menu overlays
 *
 * @see {@link ModalProps} for available props
 * @see {@link ModalHeaderProps} for header configuration
 * @see {@link ModalBodyProps} for body configuration
 * @see {@link ModalFooterProps} for footer configuration
 *
 * @module Modal
 * @category Overlay
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
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
