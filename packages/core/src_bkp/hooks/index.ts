/**
 * Hooks
 * Utility hooks for common React patterns
 */

// ============================================
// DS CORE HOOKS
// ============================================

// Theme Hook
export { useTheme } from './useTheme';

// Engine Hooks
export { useEngine, useIsEngine } from './useEngine';

// Tenant Hook
export { useTenant } from './useTenant';

// Branding Hook
export { useBranding } from './useBranding';

// Defaults Hooks
export { useDefaults, useDefaultVariant } from './useDefaults';

// ============================================
// UTILITY HOOKS
// ============================================

// Performance Hooks
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { useMemoCompare } from './useMemoCompare';

// UI Hooks
export { useMediaQuery } from './useMediaQuery';
export { useClickOutside } from './useClickOutside';
export { useToggle } from './useToggle';
export { useHover } from './useHover';
export { useFocus } from './useFocus';
export { useWindowSize } from './useWindowSize';
export type { WindowSize } from './useWindowSize';

// Storage Hooks
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';
export { useCookie } from './useCookie';
export type { CookieOptions } from './useCookie';

// Utility Hooks
export { useClipboard } from './useClipboard';
export type { UseClipboardReturn } from './useClipboard';
export { usePrevious } from './usePrevious';
export { useUpdateEffect } from './useUpdateEffect';
export { useDebugValue } from './useDebugValue';
export { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
