'use client';

/**
 * @fileoverview Drawer - sliding panel from any viewport edge (left/right/top/bottom).
 * Compound sub-components: Header, Body, Footer for structured layouts.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Drawer open={open} onClose={handleClose} placement="right">
 *   <Drawer.Header onClose={handleClose}>Settings</Drawer.Header>
 *   <Drawer.Body><SettingsForm /></Drawer.Body>
 *   <Drawer.Footer>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Save</Button>
 *   </Drawer.Footer>
 * </Drawer>
 * ```
 *
 * @module Drawer
 * @category Feedback
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { DrawerProps } from './contracts';
import { DrawerHeader, DrawerBody, DrawerFooter } from './compound';

export {
  type DrawerProps,
  type DrawerPlacement,
  type DrawerSize,
  DRAWER_DEFAULTS,
} from './contracts';

export { DrawerHeader, DrawerBody, DrawerFooter };
export type { DrawerHeaderProps, DrawerBodyProps, DrawerFooterProps } from './compound';

/**
 * Drawer component with multi-engine support.
 * Slides from any viewport edge. ESC to close, body scroll lock, ARIA-compliant.
 */
export const Drawer = Object.assign(
  // Create the engine-switchable base component
  createEngineComponent<DrawerProps>('Drawer', {
    classic: () => import('./engines/classic'),  // Ant Design
    modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
    rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
  }),
  // Attach compound sub-components for structured layouts (Drawer.Header, .Body, .Footer)
  {
    /** Title bar with optional close button. */
    Header: DrawerHeader,
    /** Scrollable main content area. */
    Body: DrawerBody,
    /** Sticky action-button strip at the bottom. */
    Footer: DrawerFooter,
  }
);
