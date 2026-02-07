'use client';

/**
 * @fileoverview Modal Component - Rottay Design System
 * @description A versatile modal dialog component for displaying overlay content.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Modal component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across different UI frameworks while maintaining a
 * consistent API and user experience.
 *
 * **Available Engines:**
 * - **Classic** (Ant Design): Full-featured with advanced animations and focus trapping
 * - **Modern** (DaisyUI): Utility-first styling with Tailwind CSS
 * - **Rustic** (Vanilla): Zero-dependency implementation with maximum control
 *
 * **Compound Components:**
 * The Modal supports a compound component pattern for flexible layouts:
 * - `Modal.Header`: Title section with optional close button
 * - `Modal.Body`: Scrollable content area
 * - `Modal.Footer`: Action buttons section
 * - `Modal.CloseButton`: Standalone close button
 *
 * **Multi-Tenant Theming:**
 * Modal appearance can be customized per tenant via CSS custom properties:
 * - `--modal-title-font-size`: Title text size
 * - `--modal-title-font-weight`: Title weight
 * - `--modal-title-color`: Title color
 * - `--modal-body-color`: Body text color
 * - `--modal-close-color`: Close button color
 * - `--modal-header-border`: Header border color
 * - `--modal-footer-border`: Footer border color
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal, Button } from '@rottay/design-system';
 *
 * function BasicModal() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Open Modal</Button>
 *       <Modal
 *         open={open}
 *         onClose={() => setOpen(false)}
 *         title="Welcome"
 *       >
 *         <p>This is a basic modal dialog.</p>
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Compound Components
 * ```tsx
 * import { Modal, Button } from '@rottay/design-system';
 *
 * function StructuredModal({ open, onClose }) {
 *   return (
 *     <Modal open={open} onClose={onClose}>
 *       <Modal.Header onClose={onClose} divider>
 *         Edit Profile
 *       </Modal.Header>
 *       <Modal.Body padding="lg">
 *         <ProfileForm />
 *       </Modal.Body>
 *       <Modal.Footer divider align="space-between">
 *         <Button variant="danger">Delete Account</Button>
 *         <div>
 *           <Button variant="ghost" onClick={onClose}>Cancel</Button>
 *           <Button variant="primary" onClick={handleSave}>Save</Button>
 *         </div>
 *       </Modal.Footer>
 *     </Modal>
 *   );
 * }
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * // Small modal for confirmations
 * <Modal size="sm" open={open} onClose={onClose}>
 *   <p>Are you sure?</p>
 * </Modal>
 *
 * // Large modal for forms
 * <Modal size="lg" open={open} onClose={onClose} title="Create Account">
 *   <RegistrationForm />
 * </Modal>
 *
 * // Full-screen modal for immersive content
 * <Modal size="full" open={open} onClose={onClose}>
 *   <ImageGallery />
 * </Modal>
 * ```
 *
 * @example Confirmation Dialog
 * ```tsx
 * <Modal
 *   open={open}
 *   onClose={onClose}
 *   title="Confirm Delete"
 *   okText="Delete"
 *   cancelText="Keep"
 *   onOk={handleDelete}
 *   onCancel={onClose}
 *   confirmLoading={isDeleting}
 * >
 *   <p>This action cannot be undone. Continue?</p>
 * </Modal>
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Tenant-specific modal styling
 * <div style={{
 *   '--modal-title-color': 'var(--tenant-primary)',
 *   '--modal-header-border': 'var(--tenant-border)'
 * }}>
 *   <Modal open={open} onClose={onClose} title="Branded Modal">
 *     Content with tenant-specific theming
 *   </Modal>
 * </div>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern engine for this specific modal
 * <Modal engine="modern" open={open} onClose={onClose}>
 *   DaisyUI-styled modal content
 * </Modal>
 *
 * // Global engine via provider
 * <EngineProvider engine="rustic">
 *   <Modal open={open} onClose={onClose}>
 *     All modals use vanilla implementation
 *   </Modal>
 * </EngineProvider>
 * ```
 *
 * @see {@link ModalProps} for available props
 * @see {@link ModalHeader} for header compound component
 * @see {@link ModalBody} for body compound component
 * @see {@link ModalFooter} for footer compound component
 * @see {@link Drawer} for side-panel alternative
 * @module Modal
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { ModalProps } from './types';
import { ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

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

// ============================================================================
// Compound Component Exports
// ============================================================================

export { ModalHeader, ModalBody, ModalFooter, ModalCloseButton };

// ============================================================================
// Base Component Export
// ============================================================================


// ============================================================================
// Main Component
// ============================================================================

/**
 * Modal component with multi-engine support and compound components.
 *
 * @description
 * Creates overlay dialogs for user interactions. Supports multiple sizes,
 * focus trapping, scroll prevention, and flexible content layouts via
 * compound components.
 *
 * @remarks
 * The Modal uses the engine factory pattern for rendering flexibility:
 * - Classic: Ant Design's Modal with full feature set
 * - Modern: DaisyUI modal with Tailwind utilities
 * - Rustic: Pure vanilla implementation
 *
 * **Compound Components:**
 * - `Modal.Header`: Structured header with title and close
 * - `Modal.Body`: Scrollable content container
 * - `Modal.Footer`: Action button container
 * - `Modal.CloseButton`: Standalone close trigger
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={handleClose}>
 *   <Modal.Header onClose={handleClose}>Settings</Modal.Header>
 *   <Modal.Body>
 *     <SettingsForm />
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 */
export const Modal = Object.assign(
  createEngineComponent<ModalProps>('Modal', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Header compound component for structured modal layouts.
     * Displays title and optional close button.
     */
    Header: ModalHeader,

    /**
     * Body compound component for modal content.
     * Provides scrollable area with configurable padding.
     */
    Body: ModalBody,

    /**
     * Footer compound component for action buttons.
     * Supports multiple alignment options.
     */
    Footer: ModalFooter,

    /**
     * Standalone close button component.
     * Useful for custom header layouts.
     */
    CloseButton: ModalCloseButton,
  }
);
