'use client';

/**
 * @fileoverview EngineProvider - Rottay Design System
 * @description Provides the current UI rendering engine context, enabling
 * components to render using Classic (Ant Design), Modern (DaisyUI), or Rustic (Vanilla).
 *
 * @remarks
 * The EngineProvider is the core of the multi-engine architecture:
 * - **Classic**: Enterprise Ant Design-based engine with structured components
 * - **Modern**: Contemporary DaisyUI/Tailwind CSS engine with glassmorphism
 * - **Rustic**: Minimal vanilla HTML/CSS for maximum portability
 *
 * @example Basic usage
 * ```tsx
 * import { EngineProvider, Button } from '@rottay/design-system';
 *
 * <EngineProvider defaultEngine="classic">
 *   <Button>Uses Classic engine</Button>
 * </EngineProvider>
 * ```
 *
 * @see {@link useEngineContext} - Hook to access engine context
 * @see {@link EngineName} - Valid engine names
 * @module System/Providers/Engine
 * @category System
 * @package @rottay/design-system
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from 'react';
import type { EngineName, EngineContextValue, EngineProviderProps } from '../../contracts';
import { getDefaultEngine, isValidEngine } from './registry';
import { warnOnceInDev } from '../../_internal/utils/runtime-logger';

const EngineContext = createContext<EngineContextValue | null>(null);
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Re-export type from types (single source of truth)
export type { EngineProviderProps } from '../../contracts';

export function EngineProvider({
  children,
  defaultEngine = getDefaultEngine(),
}: EngineProviderProps): React.ReactElement {
  const [engine, setEngineState] = useState<EngineName>(defaultEngine);

  // Keep the controlled runtime engine in sync before paint so route changes
  // do not briefly render with the previous engine's DOM attributes.
  useIsomorphicLayoutEffect(() => {
    if (defaultEngine !== engine && isValidEngine(defaultEngine)) {
      setEngineState(defaultEngine);
    }
  }, [defaultEngine, engine]);

  const setEngine = useCallback((newEngine: EngineName) => {
    if (isValidEngine(newEngine)) {
      setEngineState(newEngine);
    } else {
      warnOnceInDev(
        `engine-provider:invalid:${String(newEngine)}`,
        `Invalid engine: ${newEngine}. Using default.`
      );
      setEngineState(getDefaultEngine());
    }
  }, []);

  // Sync engine name to DOM so CSS selectors like [data-engine='modern'] work.
  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute('data-engine', engine);
    return () => {
      document.documentElement.removeAttribute('data-engine');
    };
  }, [engine]);

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
 * Default context value used when no EngineProvider is present.
 * This allows components to work in SSR and non-provider scenarios.
 */
const defaultContextValue: EngineContextValue = {
  engine: getDefaultEngine(),
  setEngine: () => {
    warnOnceInDev(
      'engine-provider:missing',
      'setEngine called outside of EngineProvider. Wrap your app with EngineProvider to enable engine switching.'
    );
  },
};

export function useEngineContext(): EngineContextValue {
  const context = useContext(EngineContext);
  // Unlike useTenant/useFeatures which throw when the provider is missing, the
  // engine context falls back to a default. This is intentional: many components
  // can render with the default engine during SSR or in unit tests without
  // requiring the full provider tree.
  return context || defaultContextValue;
}

export { EngineContext };
