/**
 * @fileoverview Tour Engine Exports - Rottay Design System
 * @description Barrel exports for all Tour engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Tour with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation with cards
 * - **Apollo**: Pure vanilla HTML/CSS with portal rendering
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
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Tour engine="hermes" steps={tourSteps} open={isOpen}>
 *   Start Tour
 * </Tour>
 * ```
 *
 * @see {@link Tour} - Main component with engine switching
 * @module Tour/Engines
 * @category Overlay
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
