/**
 * @fileoverview Tour Engine Exports - Rottay Design System
 * @description Barrel exports for all Tour engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Tour with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation with cards
 * - **Rustic**: Pure vanilla HTML/CSS with portal rendering
 *
 * All engines implement:
 * - Spotlight effect with mask overlay
 * - Step navigation with indicators
 * - Target element highlighting
 * - Keyboard navigation (Escape to close)
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Tour engine="modern" steps={tourSteps} open={isOpen}>
 *   Start Tour
 * </Tour>
 * ```
 *
 * @see {@link Tour} - Main component with engine switching
 * @module Tour/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
