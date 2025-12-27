/**
 * @fileoverview Modal Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Modal primitive.
 *
 * @remarks
 * This barrel file provides convenient access to all Modal compound
 * components. These components are designed to work together to create
 * structured modal layouts with consistent styling and behavior.
 *
 * **Component Hierarchy:**
 * ```
 * <Modal>
 *   <Modal.Header />      ← Fixed at top, contains title & close button
 *   <Modal.Body />        ← Scrollable content area
 *   <Modal.Footer />      ← Fixed at bottom, contains action buttons
 *   <Modal.CloseButton /> ← Standalone close button (optional)
 * </Modal>
 * ```
 *
 * **Versus Props-Based Usage:**
 * Compound components offer more flexibility than using `title` and `footer` props:
 * - Custom header layouts (icons, badges, tabs)
 * - Fine-grained control over padding and dividers
 * - Multiple content sections in body
 * - Complex footer arrangements
 *
 * @example Full Modal Layout
 * ```tsx
 * import { Modal, Button, Avatar } from '@rottay/design-system';
 *
 * <Modal open={open} onClose={handleClose}>
 *   <Modal.Header onClose={handleClose} divider>
 *     <Avatar src={user.avatar} size="sm" />
 *     <span>Edit Profile</span>
 *   </Modal.Header>
 *   <Modal.Body padding="lg">
 *     <ProfileForm user={user} onChange={setFormData} />
 *   </Modal.Body>
 *   <Modal.Footer divider align="space-between">
 *     <Button variant="danger" onClick={handleDelete}>
 *       Delete Account
 *     </Button>
 *     <div>
 *       <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *       <Button variant="primary" onClick={handleSave}>Save</Button>
 *     </div>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @example Minimal Modal
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <Modal.Body>
 *     <p>Simple content without header or footer</p>
 *     <Modal.CloseButton onClose={handleClose} />
 *   </Modal.Body>
 * </Modal>
 * ```
 *
 * @module Modal/Compound
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

/**
 * Modal header component for title and close button.
 * @see {@link ModalHeaderProps}
 */
export { ModalHeader } from './Header';

/**
 * Modal body component for main content.
 * @see {@link ModalBodyProps}
 */
export { ModalBody } from './Body';

/**
 * Modal footer component for action buttons.
 * @see {@link ModalFooterProps}
 */
export { ModalFooter } from './Footer';

/**
 * Standalone close button component.
 * @see {@link ModalCloseButtonProps}
 */
export { ModalCloseButton } from './CloseButton';
