'use client';

/**
 * @fileoverview EngineProvider - Rottay Design System
 * @description Provides the current UI rendering engine context, enabling
 * components to render using Titan (Ant Design), Hermes (DaisyUI), or Apollo (Vanilla).
 *
 * @remarks
 * The EngineProvider is the core of the multi-engine architecture:
 * - **Titan**: Full-featured Ant Design-based engine with rich components
 * - **Hermes**: Lightweight DaisyUI/Tailwind CSS engine for smaller bundles
 * - **Apollo**: Zero-dependency vanilla HTML/CSS for maximum portability
 *
 * Components automatically use the engine from context, but can override
 * it with the `engine` prop for granular control.
 *
 * @example Basic usage
 * ```tsx
 * import { EngineProvider, Button } from '@rottay/design-system';
 *
 * <EngineProvider defaultEngine="titan">
 *   <Button>Uses Titan engine</Button>
 * </EngineProvider>
 * ```
 *
 * @example Changing engine at runtime
 * ```tsx
 * function ThemeSwitcher() {
 *   const { engine, setEngine } = useEngineContext();
 *
 *   return (
 *     <select value={engine} onChange={(e) => setEngine(e.target.value)}>
 *       <option value="titan">Titan (Ant Design)</option>
 *       <option value="hermes">Hermes (DaisyUI)</option>
 *       <option value="apollo">Apollo (Vanilla)</option>
 *     </select>
 *   );
 * }
 * ```
 *
 * @example Component-level override
 * ```tsx
 * <EngineProvider defaultEngine="titan">
 *   <Button>Uses Titan</Button>
 *   <Button engine="hermes">Uses Hermes</Button>
 *   <Button engine="apollo">Uses Apollo</Button>
 * </EngineProvider>
 * ```
 *
 * @see {@link useEngineContext} - Hook to access engine context
 * @see {@link EngineName} - Valid engine names
 * @module System/Providers/Engine
 * @category System
 * @package @rottay/design-system
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EngineName, EngineContextValue, EngineProviderProps } from '../../types';
import { getDefaultEngine, isValidEngine } from '../../engines/registry';

const EngineContext = createContext<EngineContextValue | null>(null);

// Re-export type from types (single source of truth)
export type { EngineProviderProps } from '../../types';

export function EngineProvider({
  children,
  defaultEngine = getDefaultEngine(),
}: EngineProviderProps): React.ReactElement {
  const [engine, setEngineState] = useState<EngineName>(defaultEngine);

  const setEngine = useCallback((newEngine: EngineName) => {
    if (isValidEngine(newEngine)) {
      setEngineState(newEngine);
    } else {
      console.warn(`Invalid engine: ${newEngine}. Using default.`);
      setEngineState(getDefaultEngine());
    }
  }, []);

  const value: EngineContextValue = {
    engine,
    setEngine,
  };

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
    console.warn('setEngine called outside of EngineProvider. Wrap your app with EngineProvider to enable engine switching.');
  },
};

export function useEngineContext(): EngineContextValue {
  const context = useContext(EngineContext);
  // Return default context if no provider is present (SSR-safe)
  return context || defaultContextValue;
}

export { EngineContext };
