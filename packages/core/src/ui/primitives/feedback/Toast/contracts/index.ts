/**
 * @fileoverview Toast Types - Rottay Design System
 * @description Type definitions and constants for the Toast component.
 *
 * @remarks
 * This module provides:
 * - Type definitions for Toast component
 * - Default configuration values for toast behavior
 * - Animation timing constants
 * - Position mapping utilities
 * - Variant color definitions for theming
 *
 * @module Toast/Types
 * @category Feedback
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, Variant } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

// ============================================================================
// Variant Types
// ============================================================================

/**
 * Toast variant types.
 *
 * @description
 * Extends the base Variant type with an additional 'info' variant
 * commonly used for informational toast messages.
 *
 * Available variants:
 * - `default` - Neutral styling
 * - `primary` - Primary brand color
 * - `secondary` - Secondary brand color
 * - `success` - Success/positive feedback
 * - `warning` - Warning/caution feedback
 * - `error` - Error/negative feedback
 * - `info` - Informational messages
 */
export type ToastVariant = Variant | 'info';

// ============================================================================
// Position Types
// ============================================================================

/**
 * Toast position options.
 *
 * @description
 * Defines the six possible screen positions for toast containers.
 * Combines vertical (top/bottom) with horizontal (left/center/right).
 *
 * @example
 * ```tsx
 * // Top positions
 * <ToastProvider position="top-left" />
 * <ToastProvider position="top-center" />
 * <ToastProvider position="top-right" />
 *
 * // Bottom positions
 * <ToastProvider position="bottom-left" />
 * <ToastProvider position="bottom-center" />
 * <ToastProvider position="bottom-right" />
 * ```
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// ============================================================================
// Countdown Variant
// ============================================================================

/**
 * Countdown affordance for the undo-window Toast recipe (`Toast.Undo`).
 *
 * - `ring`: a circular SVG that depletes over the undo window
 * - `bar`: a linear bar that depletes over the undo window
 * - `none`: no visible countdown (auto-dismiss still runs)
 *
 * Under `prefers-reduced-motion` the depletion animation is disabled: the
 * affordance renders static and does not loop.
 */
export type ToastCountdownVariant = 'ring' | 'bar' | 'none';

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for the Toast component.
 *
 * @description
 * Complete prop interface for the Toast component. Extends base
 * component props and engine-aware props for multi-engine support.
 *
 * @example Basic Usage
 * ```tsx
 * <Toast
 *   variant="success"
 *   title="Saved!"
 *   description="Your changes have been saved."
 *   visible={true}
 *   onClose={() => setVisible(false)}
 * />
 * ```
 *
 * @example With Action
 * ```tsx
 * <Toast
 *   variant="info"
 *   title="Update Available"
 *   description="A new version is ready."
 *   action={{
 *     label: 'Update Now',
 *     onClick: () => handleUpdate(),
 *     closeOnClick: true,
 *   }}
 *   visible={true}
 * />
 * ```
 */
export interface ToastProps extends BaseComponentProps, EngineAwareProps {
  /**
   * Color variant of the toast.
   * Determines background, text, and icon colors.
   * @default 'default'
   */
  variant?: ToastVariant;

  /**
   * Title text displayed prominently at the top.
   * Optional - toasts can have just a description.
   */
  title?: ReactNode;

  /**
   * Description/message text of the toast.
   * Displayed below the title with slightly reduced emphasis.
   */
  description?: ReactNode;

  /**
   * Custom icon to display.
   * If not provided, a default icon is shown based on variant.
   * Set to `null` to hide the icon entirely.
   */
  icon?: ReactNode;

  /**
   * Whether the toast can be manually closed by the user.
   * Shows a close button when true.
   * @default true
   */
  closable?: boolean;

  /**
   * Callback fired when the toast is closed.
   * Triggered by close button, auto-dismiss, or action with closeOnClick.
   */
  onClose?: () => void;

  /**
   * Duration in milliseconds before auto-dismiss.
   * Set to 0 to disable auto-dismiss.
   * @default 5000
   */
  duration?: number;

  /**
   * Controls toast visibility.
   * When false, triggers exit animation and then unmounts.
   * @default true
   */
  visible?: boolean;

  /**
   * Action button configuration.
   * Displays a button with custom label and onClick handler.
   */
  action?: ToastAction;

  /**
   * Whether to show a progress bar indicating time remaining.
   * The bar animates from full to empty over the duration.
   * @default false
   */
  showProgress?: boolean;

  /**
   * Whether to pause auto-dismiss when user hovers over the toast.
   * The timer resumes when the mouse leaves.
   * @default true
   */
  pauseOnHover?: boolean;

  /**
   * Border radius preset for the toast container.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg';

  /**
   * Whether the toast has a box shadow.
   * @default true
   */
  shadow?: boolean;

  /**
   * Custom content to render inside the toast.
   * Displayed after title/description in the content area.
   */
  children?: ReactNode;
}

// ============================================================================
// Action Configuration
// ============================================================================

/**
 * Toast action button configuration.
 *
 * @description
 * Defines the properties for an optional action button within a toast.
 * Useful for undo actions, retry buttons, or navigation links.
 *
 * @example
 * ```tsx
 * const undoAction: ToastAction = {
 *   label: 'Undo',
 *   onClick: () => restoreItem(),
 *   closeOnClick: true, // Close toast after clicking
 * };
 *
 * toast.success('Item deleted', undefined, { action: undoAction });
 * ```
 */
export interface ToastAction {
  /** Text or element to display on the action button */
  label: ReactNode;

  /** Callback function when the action button is clicked */
  onClick: () => void;

  /**
   * Whether clicking the action should also close the toast.
   * @default true
   */
  closeOnClick?: boolean;
}

// ============================================================================
// Provider Configuration
// ============================================================================

/**
 * Configuration options for ToastProvider.
 *
 * @description
 * Defines default behavior for all toasts rendered within the provider.
 * Individual toasts can override these defaults.
 *
 * @example
 * ```tsx
 * <ToastProvider
 *   position="bottom-center"
 *   duration={3000}
 *   max={3}
 *   gap={12}
 *   pauseOnHover={true}
 *   reverseOrder={false}
 * >
 *   <App />
 *   <Toast.Container />
 * </ToastProvider>
 * ```
 */
export interface ToastProviderConfig {
  /**
   * Default position for toasts.
   * @default 'top-right'
   */
  position?: ToastPosition;

  /**
   * Default duration for toasts in milliseconds.
   * @default 5000
   */
  duration?: number;

  /**
   * Maximum number of simultaneous toasts.
   * Oldest toasts are hidden when limit is reached.
   * @default 5
   */
  max?: number;

  /**
   * Gap between stacked toasts in pixels.
   * @default 8
   */
  gap?: number;

  /**
   * Whether to pause auto-dismiss on hover by default.
   * @default true
   */
  pauseOnHover?: boolean;

  /**
   * Whether new toasts appear at the top of the stack.
   * When false, new toasts appear at the bottom.
   * @default false
   */
  reverseOrder?: boolean;
}

// ============================================================================
// Toast Options
// ============================================================================

/**
 * Options for creating a toast programmatically.
 *
 * @description
 * Used with the `useToast` hook and `toast` object.
 * Extends ToastProps but excludes visibility and close callback
 * which are managed internally.
 *
 * @example
 * ```tsx
 * const { show } = useToast();
 *
 * const toastId = show({
 *   variant: 'success',
 *   title: 'File Uploaded',
 *   description: 'Your file has been uploaded successfully.',
 *   duration: 5000,
 *   showProgress: true,
 *   action: {
 *     label: 'View',
 *     onClick: () => navigateToFile(),
 *   },
 * });
 * ```
 */
export interface ToastOptions extends Omit<ToastProps, 'visible' | 'onClose'> {
  /**
   * Unique ID for the toast.
   * Auto-generated if not provided.
   * Can be used to dismiss or update the toast later.
   */
  id?: string;

  /**
   * Position override for this specific toast.
   * Overrides the provider's default position.
   */
  position?: ToastPosition;
}

// ============================================================================
// Toast Methods
// ============================================================================

/**
 * Methods provided by the useToast hook.
 *
 * @description
 * Interface for the toast methods available through context.
 * All methods return the toast ID for reference.
 *
 * @example
 * ```tsx
 * const { show, success, error, dismiss, dismissAll } = useToast();
 *
 * // Show variants
 * success('Saved!', 'Your changes have been saved.');
 * error('Error', 'Something went wrong.');
 *
 * // Show custom toast and store ID
 * const id = show({ variant: 'info', title: 'Loading...' });
 *
 * // Later, dismiss it
 * dismiss(id);
 *
 * // Or dismiss all
 * dismissAll();
 * ```
 */
export interface ToastMethods {
  /** Show a toast with custom options */
  show: (options: ToastOptions) => string;

  /** Show a success toast */
  success: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;

  /** Show an error toast */
  error: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;

  /** Show a warning toast */
  warning: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;

  /** Show an info toast */
  info: (title: ReactNode, description?: ReactNode, options?: Partial<ToastOptions>) => string;

  /** Dismiss a specific toast by ID */
  dismiss: (id: string) => void;

  /** Dismiss all active toasts */
  dismissAll: () => void;

  /** Update an existing toast's options */
  update: (id: string, options: Partial<ToastOptions>) => void;
}

// ============================================================================
// Internal State
// ============================================================================

/**
 * Internal state for a single toast.
 *
 * @description
 * Represents the complete state of a toast in the provider's stack.
 * Used internally by the toast system for state management.
 *
 * @internal
 */
export interface ToastState {
  /** Unique identifier for the toast */
  id: string;

  /** Whether the toast is currently visible (false triggers exit animation) */
  visible: boolean;

  /** Timestamp when the toast was created */
  createdAt: number;

  /** Whether the auto-dismiss timer is paused (e.g., on hover) */
  paused: boolean;

  /** The toast's configuration options */
  options: ToastOptions;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values for individual Toast components.
 *
 * @description
 * These defaults are applied when props are not explicitly provided.
 *
 * @example
 * ```tsx
 * // Component uses defaults automatically
 * <Toast title="Message" />
 * // Equivalent to:
 * <Toast
 *   title="Message"
 *   variant="default"
 *   duration={5000}
 *   closable={true}
 *   position="top-right"
 *   pauseOnHover={true}
 *   showProgress={false}
 *   radius="md"
 *   shadow={true}
 * />
 * ```
 */
export const TOAST_DEFAULTS = {
  /** Default variant style */
  variant: 'default' as const,
  /** Auto-dismiss duration in milliseconds (5 seconds) */
  duration: 5000,
  /** Whether the toast can be manually closed */
  closable: true,
  /** Default screen position */
  position: 'top-right' as const,
  /** Pause auto-dismiss when user hovers over toast */
  pauseOnHover: true,
  /** Whether to show the countdown progress bar */
  showProgress: false,
  /** Border radius preset */
  radius: 'md' as const,
  /** Whether to apply box shadow */
  shadow: true,
};

// ============================================================================
// Container Defaults
// ============================================================================

/**
 * Default configuration values for ToastContainer.
 *
 * @description
 * Controls the behavior of the toast stack container.
 *
 * @example
 * ```tsx
 * <Toast.Container
 *   max={5}      // Maximum visible toasts
 *   gap={8}      // Spacing between toasts in pixels
 *   reverseOrder={false}  // Newest toasts appear at bottom
 * />
 * ```
 */
export const TOAST_CONTAINER_DEFAULTS = {
  /** Maximum number of simultaneous toasts */
  max: 5,
  /** Gap between stacked toasts in pixels */
  gap: 8,
  /** If true, new toasts appear at the top of the stack */
  reverseOrder: false,
};

// ============================================================================
// Animation Timings
// ============================================================================

/**
 * Animation duration constants for toast enter/exit transitions.
 *
 * @description
 * These values control the speed of toast animations.
 * Used consistently across all engine implementations.
 */
export const TOAST_ANIMATION = {
  /** Duration for enter animation in milliseconds */
  enterDuration: 300,
  /** Duration for exit animation in milliseconds */
  exitDuration: 200,
};

// ============================================================================
// Position Mapping
// ============================================================================

/**
 * Maps position string values to vertical and horizontal components.
 *
 * @description
 * Used by the container component to calculate CSS positioning.
 *
 * @example
 * ```tsx
 * const positionInfo = POSITION_MAP['top-right'];
 * // { vertical: 'top', horizontal: 'right' }
 * ```
 */
export const POSITION_MAP: Record<string, { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' }> = {
  'top-left': { vertical: 'top', horizontal: 'left' },
  'top-center': { vertical: 'top', horizontal: 'center' },
  'top-right': { vertical: 'top', horizontal: 'right' },
  'bottom-left': { vertical: 'bottom', horizontal: 'left' },
  'bottom-center': { vertical: 'bottom', horizontal: 'center' },
  'bottom-right': { vertical: 'bottom', horizontal: 'right' },
};

// ============================================================================
// Variant Colors
// ============================================================================

/**
 * Color definitions for each toast variant.
 *
 * @description
 * Provides fallback colors when CSS variables are not defined.
 * These values can be overridden by tenant themes via CSS custom properties.
 *
 * @remarks
 * Each variant includes:
 * - `bg` - Background color
 * - `color` - Text color
 * - `borderColor` - Border color
 * - `iconColor` - Icon color
 *
 * @example
 * ```tsx
 * // Access colors programmatically
 * const successColors = VARIANT_COLORS.success;
 * // {
 * //   bg: 'var(--ds-toast-success-bg, var(--ds-color-success-bg))',
 * //   color: 'var(--ds-toast-success-color, var(--ds-color-success-700))',
 * //   borderColor: 'var(--ds-toast-success-border, var(--ds-color-success-border))',
 * //   iconColor: 'var(--ds-toast-success-icon, var(--ds-color-success))'
 * // }
 * ```
 */
export const VARIANT_COLORS = {
  /** Default/neutral variant colors */
  default: {
    bg: 'var(--ds-toast-default-bg, var(--ds-color-bg-elevated))',
    color: 'var(--ds-toast-default-color, var(--ds-color-text-primary))',
    borderColor: 'var(--ds-toast-default-border, var(--ds-color-border-primary))',
    iconColor: 'var(--ds-toast-default-icon, var(--ds-color-text-secondary))',
  },
  /** Success variant colors - green tones */
  success: {
    bg: 'var(--ds-toast-success-bg, var(--ds-color-success-bg))',
    color: 'var(--ds-toast-success-color, var(--ds-color-success-700))',
    borderColor: 'var(--ds-toast-success-border, var(--ds-color-success-border))',
    iconColor: 'var(--ds-toast-success-icon, var(--ds-color-success))',
  },
  /** Error variant colors - red tones */
  error: {
    bg: 'var(--ds-toast-error-bg, var(--ds-color-error-bg))',
    color: 'var(--ds-toast-error-color, var(--ds-color-error-700))',
    borderColor: 'var(--ds-toast-error-border, var(--ds-color-error-border))',
    iconColor: 'var(--ds-toast-error-icon, var(--ds-color-error))',
  },
  /** Warning variant colors - amber/yellow tones */
  warning: {
    bg: 'var(--ds-toast-warning-bg, var(--ds-color-warning-bg))',
    color: 'var(--ds-toast-warning-color, var(--ds-color-warning-700))',
    borderColor: 'var(--ds-toast-warning-border, var(--ds-color-warning-border))',
    iconColor: 'var(--ds-toast-warning-icon, var(--ds-color-warning))',
  },
  /** Info variant colors - blue tones */
  info: {
    bg: 'var(--ds-toast-info-bg, var(--ds-color-info-bg))',
    color: 'var(--ds-toast-info-color, var(--ds-color-info-700))',
    borderColor: 'var(--ds-toast-info-border, var(--ds-color-info-border))',
    iconColor: 'var(--ds-toast-info-icon, var(--ds-color-info))',
  },
  /** Primary variant colors - blue tones */
  primary: {
    bg: 'var(--ds-toast-primary-bg, var(--ds-color-alpha-primary-10))',
    color: 'var(--ds-toast-primary-color, var(--ds-color-primary-700))',
    borderColor: 'var(--ds-toast-primary-border, var(--ds-color-alpha-primary-20))',
    iconColor: 'var(--ds-toast-primary-icon, var(--ds-color-primary))',
  },
  /** Secondary variant colors - purple tones */
  secondary: {
    bg: 'var(--ds-toast-secondary-bg, var(--ds-color-alpha-secondary-10))',
    color: 'var(--ds-toast-secondary-color, var(--ds-color-secondary-700))',
    borderColor: 'var(--ds-toast-secondary-border, var(--ds-color-alpha-secondary-20))',
    iconColor: 'var(--ds-toast-secondary-icon, var(--ds-color-secondary))',
  },
  /** Gradient variant - decorative gradient background. Self-contained brand
   *  gradient (not --ds-gradient-primary, which is the subtle button-accent sheen). */
  gradient: {
    bg: 'var(--ds-toast-gradient-bg, linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary)))',
    color: 'var(--ds-toast-gradient-color, var(--ds-color-text-on-primary))',
    borderColor: 'transparent',
    iconColor: 'var(--ds-toast-gradient-icon, var(--ds-color-text-on-primary))',
  },
};
