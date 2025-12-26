/**
 * Engine Provider
 * Provides the current UI engine context
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EngineName, EngineContextValue, EngineProviderProps } from '../../../types';
import { getDefaultEngine, isValidEngine } from '../../engines/registry';

const EngineContext = createContext<EngineContextValue | null>(null);

// Re-export type from types (single source of truth)
export type { EngineProviderProps } from '../../../types';

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

export function useEngineContext(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngineContext must be used within EngineProvider');
  }
  return context;
}

export { EngineContext };
