/**
 * @fileoverview Toast Types - Rottay Design System
 * @description Type definitions and constants for the Toast component.
 * Re-exports from centralized types with local default configurations.
 *
 * @remarks
 * This module provides:
 * - Type re-exports from the centralized types package
 * - Default configuration values for toast behavior
 * - Animation timing constants
 * - Position mapping utilities
 * - Variant color definitions for theming
 *
 * @module Toast/Types
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Type Re-exports
// ============================================================================

/**
 * Re-export all Toast types from centralized type definitions.
 * @see {@link ToastProps} - Main component props
 * @see {@link ToastVariant} - Available toast variants
 * @see {@link ToastPosition} - Positioning options
 * @see {@link ToastAction} - Action button configuration
 * @see {@link ToastProviderConfig} - Provider configuration
 * @see {@link ToastOptions} - Options for programmatic toasts
 * @see {@link ToastMethods} - Hook methods interface
 * @see {@link ToastState} - Internal state interface
 */
export type {
  ToastProps,
  ToastVariant,
  ToastPosition,
  ToastAction,
  ToastProviderConfig,
  ToastOptions,
  ToastMethods,
  ToastState,
} from '../../../../../types/primitives/feedback/Toast';

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
 * // { bg: '#f0fdf4', color: '#166534', borderColor: '#86efac', iconColor: '#22c55e' }
 * ```
 */
export const VARIANT_COLORS = {
  /** Default/neutral variant colors */
  default: {
    bg: '#ffffff',
    color: '#1f2937',
    borderColor: '#e5e7eb',
    iconColor: '#6b7280',
  },
  /** Success variant colors - green tones */
  success: {
    bg: '#f0fdf4',
    color: '#166534',
    borderColor: '#86efac',
    iconColor: '#22c55e',
  },
  /** Error variant colors - red tones */
  error: {
    bg: '#fef2f2',
    color: '#991b1b',
    borderColor: '#fecaca',
    iconColor: '#ef4444',
  },
  /** Warning variant colors - amber/yellow tones */
  warning: {
    bg: '#fffbeb',
    color: '#92400e',
    borderColor: '#fde68a',
    iconColor: '#f59e0b',
  },
  /** Info variant colors - blue tones */
  info: {
    bg: '#eff6ff',
    color: '#1e40af',
    borderColor: '#bfdbfe',
    iconColor: '#3b82f6',
  },
  /** Primary variant colors - blue tones */
  primary: {
    bg: '#eff6ff',
    color: '#1e40af',
    borderColor: '#bfdbfe',
    iconColor: '#3b82f6',
  },
  /** Secondary variant colors - purple tones */
  secondary: {
    bg: '#f5f3ff',
    color: '#5b21b6',
    borderColor: '#c4b5fd',
    iconColor: '#8b5cf6',
  },
  /** Gradient variant - decorative gradient background */
  gradient: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    borderColor: 'transparent',
    iconColor: '#ffffff',
  },
};
