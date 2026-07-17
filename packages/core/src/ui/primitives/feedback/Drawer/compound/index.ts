/**
 * @fileoverview Drawer Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Drawer primitive.
 *
 * @remarks
 * This barrel file provides convenient access to all Drawer compound
 * components. These components are designed to work together to create
 * structured drawer layouts with consistent styling and behavior.
 *
 * **Component Hierarchy:**
 * ```
 * <Drawer>
 *   <Drawer.Header />  ← Fixed at top, contains title & close button
 *   <Drawer.Body />    ← Scrollable content area
 *   <Drawer.Footer />  ← Fixed at bottom, contains action buttons
 * </Drawer>
 * ```
 *
 * @example Full Drawer Layout
 * ```tsx
 * import { Drawer } from '@rottay/design-system';
 *
 * <Drawer open={open} onClose={handleClose} placement="right">
 *   <Drawer.Header onClose={handleClose} divider>
 *     Edit Profile
 *   </Drawer.Header>
 *   <Drawer.Body>
 *     <ProfileForm user={user} />
 *   </Drawer.Body>
 *   <Drawer.Footer divider>
 *     <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Drawer.Footer>
 * </Drawer>
 * ```
 *
 * @module Drawer/Compound
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

export { DrawerHeader } from './Header';
export type { DrawerHeaderProps } from './Header';

export { DrawerBody } from './Body';
export type { DrawerBodyProps } from './Body';

export { DrawerFooter } from './Footer';
export type { DrawerFooterProps } from './Footer';
