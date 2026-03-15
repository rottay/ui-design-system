'use client';

/**
 * @fileoverview Drawer Component - Rottay Design System
 * @description A sliding panel component that emerges from the edge of the screen.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Drawer component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Classic (Ant Design), Modern (DaisyUI), and Rustic
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - drawer styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Drawer } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Open Drawer</Button>
 *       <Drawer open={open} onClose={() => setOpen(false)} title="Settings">
 *         <p>Drawer content goes here</p>
 *       </Drawer>
 *     </>
 *   );
 * }
 * ```
 *
 * @example With Compound Components
 * ```tsx
 * import { Drawer, Button } from '@rottay/design-system';
 *
 * <Drawer open={open} onClose={handleClose}>
 *   <Drawer.Header onClose={handleClose} divider>
 *     User Profile
 *   </Drawer.Header>
 *   <Drawer.Body>
 *     <UserProfileForm />
 *   </Drawer.Body>
 *   <Drawer.Footer divider>
 *     <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save Changes</Button>
 *   </Drawer.Footer>
 * </Drawer>
 * ```
 *
 * @example Different Placements
 * ```tsx
 * // Right side (default)
 * <Drawer placement="right" open={open} onClose={onClose}>...</Drawer>
 *
 * // Left side navigation
 * <Drawer placement="left" open={open} onClose={onClose}>...</Drawer>
 *
 * // Bottom sheet (mobile-friendly)
 * <Drawer placement="bottom" open={open} onClose={onClose}>...</Drawer>
 *
 * // Top notification panel
 * <Drawer placement="top" open={open} onClose={onClose}>...</Drawer>
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Drawer automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Drawer open={open} onClose={onClose}>
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Drawer>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Drawer engine="modern" open={open} onClose={onClose}>
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Drawer>
 * ```
 *
 * @see {@link DrawerProps} for complete prop documentation
 * @see {@link DrawerHeader} for header compound component
 * @see {@link DrawerBody} for body compound component
 * @see {@link DrawerFooter} for footer compound component
 *
 * @module Drawer
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { DrawerProps } from './Drawer.types';
import { DrawerHeader, DrawerBody, DrawerFooter } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export {
  type DrawerProps,
  type DrawerPlacement,
  type DrawerSize,
  DRAWER_DEFAULTS,
} from './Drawer.types';

// ============================================================================
// Compound Component Exports
// ============================================================================

export { DrawerHeader, DrawerBody, DrawerFooter };
export type { DrawerHeaderProps, DrawerBodyProps, DrawerFooterProps } from './compound';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Drawer component with multi-engine support and compound components.
 *
 * @description
 * A sliding panel that appears from the edge of the viewport. Ideal for:
 * - Navigation menus
 * - Settings panels
 * - Detail views
 * - Forms and wizards
 * - Shopping carts
 *
 * @remarks
 * - Supports all four edge placements (left, right, top, bottom)
 * - Includes keyboard navigation (ESC to close)
 * - Manages body scroll lock automatically
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link DrawerProps}
 * @returns React component with Header, Body, and Footer compound components
 *
 * @example
 * ```tsx
 * <Drawer open={isOpen} onClose={() => setIsOpen(false)} placement="right">
 *   <Drawer.Header>Title</Drawer.Header>
 *   <Drawer.Body>Content</Drawer.Body>
 *   <Drawer.Footer>Actions</Drawer.Footer>
 * </Drawer>
 * ```
 */
export const Drawer = Object.assign(
  createEngineComponent<DrawerProps>('Drawer', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /**
     * Header section of the drawer.
     * Contains the title and optional close button.
     * @see {@link DrawerHeader}
     */
    Header: DrawerHeader,

    /**
     * Body/content section of the drawer.
     * Scrollable area for main content.
     * @see {@link DrawerBody}
     */
    Body: DrawerBody,

    /**
     * Footer section of the drawer.
     * Typically contains action buttons.
     * @see {@link DrawerFooter}
     */
    Footer: DrawerFooter,
  }
);
