'use client';

/**
 * @fileoverview Focus-mode adapter -- framework-agnostic context for
 * injecting an app-managed focus-mode boolean into DS patterns that
 * support hide-on-focus behavior.
 *
 * @description
 * The DS deliberately does not own focus-mode state -- it is an
 * app-level concept (toggled by a hotkey, a sidebar control, or any
 * other product-specific affordance). Patterns that want to react to
 * focus mode (e.g. by hiding chrome that distracts from the primary
 * content) should resolve the current value via this context.
 *
 * Mirrors the `NavigationLinkProvider` adapter pattern: the DS stays
 * framework-agnostic and the consuming app injects its specific
 * implementation once at the root.
 *
 * Usage in an app's root layout (or providers tree):
 *
 * ```tsx
 * import { FocusModeProvider } from '@rottay/design-system';
 * import { useFocusMode } from '@/providers/focus-mode-context';
 *
 * function FocusModeBridge({ children }: { children: ReactNode }) {
 *   const { isFocusMode } = useFocusMode();
 *   return (
 *     <FocusModeProvider value={isFocusMode}>
 *       {children}
 *     </FocusModeProvider>
 *   );
 * }
 * ```
 *
 * Usage inside a DS pattern that supports hide-on-focus:
 *
 * ```tsx
 * import { useDsFocusMode } from '../../../runtime/focus-mode';
 *
 * function MyPattern({ hideOnFocus }: { hideOnFocus?: boolean }) {
 *   const isFocusMode = useDsFocusMode();
 *   if (hideOnFocus && isFocusMode) return null;
 *   return <Box>...</Box>;
 * }
 * ```
 *
 * The pattern stays framework-agnostic: when no provider is mounted,
 * `useDsFocusMode()` returns `false`, so patterns behave as if focus
 * mode is off (i.e. nothing hides). This keeps DS components usable in
 * apps that have no focus-mode concept at all.
 *
 * @module @rottay/design-system/runtime/focus-mode
 */

import { createContext, useContext, type ReactNode } from 'react';

const FocusModeContext = createContext<boolean>(false);

export interface FocusModeProviderProps {
  /** Current focus-mode state from the consuming app. */
  value: boolean;
  children: ReactNode;
}

/**
 * Provider that supplies the current focus-mode boolean to DS patterns.
 * Mount once near the root of the app's provider tree (typically inside
 * the same layer as `NavigationLinkProvider`) and DS patterns that
 * support hide-on-focus will pick it up automatically.
 */
export function FocusModeProvider({
  value,
  children,
}: FocusModeProviderProps) {
  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

/**
 * Hook for DS patterns to read the current focus-mode value. Returns
 * `false` when no provider is mounted, so patterns degrade gracefully
 * in apps that have no focus-mode concept.
 */
export function useDsFocusMode(): boolean {
  return useContext(FocusModeContext);
}
