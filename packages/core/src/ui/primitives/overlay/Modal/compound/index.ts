/**
 * @fileoverview Modal Compound Components - Rottay Design System
 * @description Barrel export for Modal compound components including Header,
 * Body, Footer, and CloseButton for composing modal layouts.
 *
 * @remarks
 * These compound components provide a structured API for building modal dialogs
 * with consistent layout and theming. They are accessed via `Modal.Header`,
 * `Modal.Body`, `Modal.Footer`, and `Modal.CloseButton` after importing Modal.
 *
 * **Component Hierarchy:**
 * ```
 * <Modal>
 *   <Modal.Header>      -- Title bar with optional close button
 *   <Modal.Body>        -- Scrollable content area
 *   <Modal.Footer>      -- Action buttons row
 * </Modal>
 * ```
 *
 * **Layout Behavior:**
 * - Header and Footer use `flexShrink: 0` to maintain fixed height
 * - Body uses `flex: 1` and `overflowY: auto` for scrollable content
 * - All sections support configurable padding via PADDING_MAP
 *
 * @example Complete Modal Layout
 * ```tsx
 * import { Modal, Button } from '@rottay/design-system';
 *
 * <Modal open={isOpen} onClose={handleClose}>
 *   <Modal.Header onClose={handleClose} divider>
 *     Edit User Profile
 *   </Modal.Header>
 *   <Modal.Body>
 *     <UserForm data={userData} />
 *   </Modal.Body>
 *   <Modal.Footer divider>
 *     <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 *
 * @see {@link ModalHeader} for the header section
 * @see {@link ModalBody} for the body/content section
 * @see {@link ModalFooter} for the footer/actions section
 * @see {@link ModalCloseButton} for the standalone close button
 * @see {@link Modal} for the parent component
 *
 * @module Modal/Compound
 * @category Overlay
 * @package @rottay/design-system
 */

// ============================================================================
// Compound Component Exports
// ============================================================================

export { ModalHeader } from './Header';
export { ModalBody } from './Body';
export { ModalFooter } from './Footer';
export { ModalCloseButton } from './Header/CloseButton';

// ============================================================================
// Type Exports
// ============================================================================

export type { ModalCloseButtonProps } from '../contracts';
