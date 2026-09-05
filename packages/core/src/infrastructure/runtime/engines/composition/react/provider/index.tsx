'use client';

/**
 * @fileoverview EngineProvider - Rottay Design System
 * @description Provides the current UI rendering engine context, enabling
 * components to render using Modern (the primary Rottay-native skin), Classic
 * (Ant Design) or Rustic (vanilla HTML/CSS).
 *
 * @example Basic usage
 * ```tsx
 * import { EngineProvider, Button } from '@rottay/design-system';
 *
 * <EngineProvider defaultEngine="modern">
 *   <Button>Uses the Modern engine</Button>
 * </EngineProvider>
 * ```
 *
 * @see {@link useEngineContext} - Hook to access engine context
 * @see {@link EngineName} - Valid engine names
 * @module System/Providers/Engine
 * @category System
 * @package @rottay/design-system
 */

import { claimRootAttribute } from '@/infrastructure/runtime/foundation/root-attributes/registry';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from 'react';
import type { EngineName, EngineContextValue, EngineProviderProps } from '../../../../../../foundation/contracts';
import { isValidEngine } from '../../../foundation/registry';

const EngineContext = createContext<EngineContextValue | null>(null);
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Re-export type from types (single source of truth)
export type { EngineProviderProps } from '../../../../../../foundation/contracts';

export function EngineProvider({
  children,
  defaultEngine,
}: EngineProviderProps): React.ReactElement {
  if (!isValidEngine(defaultEngine)) {
    throw new Error(
      `EngineProvider: "${String(defaultEngine)}" is not a known engine. ` +
        'Resolve one through resolveEngine; there is no fallback engine.'
    );
  }
  const [engine, setEngineState] = useState<EngineName>(defaultEngine);

  // Keep the controlled runtime engine in sync before paint so route changes
  // do not briefly render with the previous engine's DOM attributes.
  useIsomorphicLayoutEffect(() => {
    if (defaultEngine !== engine) setEngineState(defaultEngine);
  }, [defaultEngine, engine]);

  const setEngine = useCallback((newEngine: EngineName) => {
    if (!isValidEngine(newEngine)) {
      throw new Error(
        `setEngine: "${String(newEngine)}" is not a known engine. ` +
          'Selecting an unknown engine is refused rather than resolved to a default.'
      );
    }
    setEngineState(newEngine);
  }, []);

  // Sync engine name to DOM so CSS selectors like [data-engine='modern'] work.
  //
  // The bare `removeAttribute` this replaces deleted the SERVER's stamp: an app
  // that renders `data-engine` in its root layout (so engine-scoped CSS applies
  // on the first paint, before React runs) lost it on the provider's first
  // cleanup, and StrictMode reaches cleanup on every mount. `claimRootAttribute`
  // restores what it found instead, and refuses to roll back once another
  // writer owns the value.
  useIsomorphicLayoutEffect(
    () => claimRootAttribute(document.documentElement, 'data-engine', engine),
    [engine],
  );

  const value = useMemo<EngineContextValue>(() => ({
    engine,
    setEngine,
  }), [engine, setEngine]);

  return (
    <EngineContext.Provider value={value}>
      {children}
    </EngineContext.Provider>
  );
}

/**
 * Reads the active engine. Throws outside a provider, exactly as `useTenant`
 * and `useFeatures` do: which engine renders is not a question a component may
 * answer with a default, because the answer decides what the user sees.
 */
export function useEngineContext(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error(
      'useEngineContext must be used within an EngineProvider. ' +
        'Mount DesignSystemProvider, or an EngineProvider with an explicit defaultEngine.'
    );
  }
  return context;
}

/**
 * The engine a provider declares, or `null` when none is mounted.
 *
 * `null` is an ABSENCE, never a default. The component factory composes it with
 * an explicit `engine` prop and refuses when neither declares one; every other
 * consumer needs a provider and uses `useEngineContext`.
 */
export function useDeclaredEngine(): EngineName | null {
  return useContext(EngineContext)?.engine ?? null;
}

export { EngineContext };
