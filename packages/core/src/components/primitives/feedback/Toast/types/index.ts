/**
 * Toast - Core Interface
 * Re-exports from centralized types with local defaults
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

// Default values
export const TOAST_DEFAULTS = {
  variant: 'default' as const,
  duration: 5000,
  closable: true,
  position: 'top-right' as const,
  pauseOnHover: true,
  showProgress: false,
  radius: 'md' as const,
  shadow: true,
};

// Container defaults
export const TOAST_CONTAINER_DEFAULTS = {
  max: 5,
  gap: 8,
  reverseOrder: false,
};

// Animation durations
export const TOAST_ANIMATION = {
  enterDuration: 300,
  exitDuration: 200,
};

// Position mapping to CSS values
export const POSITION_MAP: Record<string, { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' }> = {
  'top-left': { vertical: 'top', horizontal: 'left' },
  'top-center': { vertical: 'top', horizontal: 'center' },
  'top-right': { vertical: 'top', horizontal: 'right' },
  'bottom-left': { vertical: 'bottom', horizontal: 'left' },
  'bottom-center': { vertical: 'bottom', horizontal: 'center' },
  'bottom-right': { vertical: 'bottom', horizontal: 'right' },
};

// Variant colors mapping
export const VARIANT_COLORS = {
  default: {
    bg: '#ffffff',
    color: '#1f2937',
    borderColor: '#e5e7eb',
    iconColor: '#6b7280',
  },
  success: {
    bg: '#f0fdf4',
    color: '#166534',
    borderColor: '#86efac',
    iconColor: '#22c55e',
  },
  error: {
    bg: '#fef2f2',
    color: '#991b1b',
    borderColor: '#fecaca',
    iconColor: '#ef4444',
  },
  warning: {
    bg: '#fffbeb',
    color: '#92400e',
    borderColor: '#fde68a',
    iconColor: '#f59e0b',
  },
  info: {
    bg: '#eff6ff',
    color: '#1e40af',
    borderColor: '#bfdbfe',
    iconColor: '#3b82f6',
  },
  primary: {
    bg: '#eff6ff',
    color: '#1e40af',
    borderColor: '#bfdbfe',
    iconColor: '#3b82f6',
  },
  secondary: {
    bg: '#f5f3ff',
    color: '#5b21b6',
    borderColor: '#c4b5fd',
    iconColor: '#8b5cf6',
  },
  gradient: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    borderColor: 'transparent',
    iconColor: '#ffffff',
  },
};
