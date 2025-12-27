/**
 * @fileoverview Toast Component - Rottay Design System
 * @description A notification component that displays brief, auto-dismissing messages.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Toast component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - toast styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * The Toast system includes a complete state management solution with ToastProvider,
 * useToast hook, and standalone toast methods for flexible integration patterns.
 *
 * @example Basic Usage with useToast Hook
 * ```tsx
 * import { ToastProvider, Toast, useToast } from '@rottay/design-system';
 *
 * // Wrap your app with ToastProvider
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <MyComponent />
 *       <Toast.Container />
 *     </ToastProvider>
 *   );
 * }
 *
 * // Use the hook in any component
 * function MyComponent() {
 *   const { success, error, warning, info } = useToast();
 *
 *   return (
 *     <button onClick={() => success('Saved!', 'Your changes have been saved.')}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Toast Variants
 * ```tsx
 * import { useToast } from '@rottay/design-system';
 *
 * function NotificationDemo() {
 *   const toast = useToast();
 *
 *   return (
 *     <>
 *       <button onClick={() => toast.success('Success!', 'Operation completed.')}>
 *         Success Toast
 *       </button>
 *       <button onClick={() => toast.error('Error!', 'Something went wrong.')}>
 *         Error Toast
 *       </button>
 *       <button onClick={() => toast.warning('Warning!', 'Please review.')}>
 *         Warning Toast
 *       </button>
 *       <button onClick={() => toast.info('Info', 'For your information.')}>
 *         Info Toast
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Toast with Actions
 * ```tsx
 * import { useToast } from '@rottay/design-system';
 *
 * function UndoableAction() {
 *   const { show } = useToast();
 *
 *   const handleDelete = () => {
 *     // Perform delete...
 *     show({
 *       variant: 'success',
 *       title: 'Item deleted',
 *       description: 'The item has been removed.',
 *       action: {
 *         label: 'Undo',
 *         onClick: () => {
 *           // Restore item
 *         },
 *       },
 *     });
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 * ```
 *
 * @example Custom Positioning
 * ```tsx
 * import { ToastProvider, Toast } from '@rottay/design-system';
 *
 * // Configure default position via provider
 * <ToastProvider position="bottom-center">
 *   <App />
 *   <Toast.Container />
 * </ToastProvider>
 *
 * // Or per-toast position override
 * toast.show({
 *   title: 'Bottom notification',
 *   position: 'bottom-right',
 * });
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * import { ThemeProvider, ToastProvider, Toast } from '@rottay/design-system';
 *
 * // Toast automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <ToastProvider>
 *     <App />
 *     <Toast.Container />
 *   </ToastProvider>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * import { Toast } from '@rottay/design-system';
 *
 * // Force a specific rendering engine
 * <Toast
 *   engine="hermes"
 *   variant="success"
 *   title="DaisyUI styled toast"
 *   visible={true}
 * />
 * ```
 *
 * @see {@link ToastProps} for complete prop documentation
 * @see {@link ToastContainer} for container compound component
 * @see {@link ToastProvider} for context provider
 * @see {@link useToast} for the toast hook
 *
 * @module Toast
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ToastProps } from './types';
import { ToastContainer } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  ToastProps,
  ToastVariant,
  ToastPosition,
  ToastAction,
  ToastProviderConfig,
  ToastOptions,
  ToastMethods,
  ToastState,
} from './types';

export {
  TOAST_DEFAULTS,
  TOAST_CONTAINER_DEFAULTS,
  TOAST_ANIMATION,
  POSITION_MAP,
  VARIANT_COLORS,
} from './types';

// ============================================================================
// Compound Component Exports
// ============================================================================

export { ToastContainer } from './compound';
export type { ToastContainerProps } from './compound';

// ============================================================================
// Base Component Export
// ============================================================================

export { BaseToast } from './base';

// ============================================================================
// Utility Exports
// ============================================================================

export {
  ToastProvider,
  useToast,
  toast,
  injectToastStyles,
  TOAST_KEYFRAMES,
} from './utils';

export type { ToastProviderProps, UseToastReturn } from './utils';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Engine-aware Toast component factory.
 *
 * @description
 * Creates a Toast component that dynamically loads the appropriate engine
 * implementation based on the current engine context or explicit engine prop.
 *
 * @remarks
 * Uses lazy loading for optimal bundle size - each engine is only loaded
 * when needed.
 *
 * @private
 */
const ToastComponent = createEngineComponent<ToastProps>('Toast', {
  /** Ant Design implementation - uses message and notification APIs */
  titan: () => import('./engines/titan'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  hermes: () => import('./engines/hermes'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  apollo: () => import('./engines/apollo'),
});

// ============================================================================
// Extended Toast with Compound Components
// ============================================================================

/**
 * Toast component with multi-engine support and compound components.
 *
 * @description
 * A notification component for displaying brief, non-intrusive messages.
 * Ideal for:
 * - Success confirmations
 * - Error notifications
 * - Warning alerts
 * - Information messages
 * - Undo actions
 *
 * @remarks
 * - Supports multiple variants (success, error, warning, info, etc.)
 * - Auto-dismisses after configurable duration
 * - Pause on hover functionality
 * - Optional progress bar indicator
 * - Action button support for undo/retry patterns
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link ToastProps}
 * @returns React component with Container compound component
 *
 * @example
 * ```tsx
 * // Using ToastProvider and useToast (recommended)
 * <ToastProvider>
 *   <App />
 *   <Toast.Container position="top-right" />
 * </ToastProvider>
 *
 * // Direct usage
 * <Toast
 *   variant="success"
 *   title="Success!"
 *   description="Your action was completed."
 *   visible={showToast}
 *   onClose={() => setShowToast(false)}
 * />
 * ```
 */
export const Toast = Object.assign(ToastComponent, {
  /**
   * Container component for rendering toast stack.
   * Manages positioning, stacking, and animations.
   * @see {@link ToastContainer}
   */
  Container: ToastContainer,
});
