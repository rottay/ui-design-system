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

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { EngineName, EngineContextValue, EngineProviderProps } from '../../types';
import { getDefaultEngine, isValidEngine } from '../../engines/registry';
import { warnOnceInDev } from '../../utils/runtime-logger';

const EngineContext = createContext<EngineContextValue | null>(null);

// Re-export type from types (single source of truth)
export type { EngineProviderProps } from '../../types';

export function EngineProvider({
  children,
  defaultEngine = getDefaultEngine(),
}: EngineProviderProps): React.ReactElement {
  const [engine, setEngineState] = useState<EngineName>(defaultEngine);

  // Sync immediately when parent changes the defaultEngine prop.
  // This is React's recommended pattern for adjusting state based on props
  // (avoids the useEffect one-render delay anti-pattern).
  if (defaultEngine !== engine && isValidEngine(defaultEngine)) {
    setEngineState(defaultEngine);
  }

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
  // Return default context if no provider is present (SSR-safe)
  return context || defaultContextValue;
}

export { EngineContext };
