/**
 * @fileoverview Toast Compound Components - Rottay Design System
 * @description Exports compound components for the Toast component.
 *
 * @remarks
 * This module exports the ToastContainer compound component which is
 * responsible for rendering and managing the toast stack. The container
 * handles positioning, stacking, animations, and portal rendering.
 *
 * @example Using Toast.Container
 * ```tsx
 * import { ToastProvider, Toast } from '@rottay/design-system';
 *
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourApp />
 *       <Toast.Container position="top-right" max={5} />
 *     </ToastProvider>
 *   );
 * }
 * ```
 *
 * @module Toast/Compound
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Compound Component Exports
// ============================================================================

/**
 * ToastContainer - Renders the toast stack at a given position.
 * @see {@link ToastContainerProps} for prop documentation
 */
export { ToastContainer } from './Container';

/**
 * Props for the ToastContainer compound component.
 */
export type { ToastContainerProps } from './Container';

/**
 * UndoToast - undo-window recipe (countdown + Undo action), reduced-motion safe.
 * @see {@link UndoToastProps} for prop documentation
 */
export { UndoToast } from './UndoToast';

/**
 * Props for the UndoToast recipe.
 */
export type { UndoToastProps } from './UndoToast';

/**
 * AnimatedCheck - draw-in success checkmark for completed confirm flows.
 * @see {@link AnimatedCheckProps} for prop documentation
 */
export { AnimatedCheck } from './AnimatedCheck';

/**
 * Props for the AnimatedCheck recipe.
 */
export type { AnimatedCheckProps } from './AnimatedCheck';
