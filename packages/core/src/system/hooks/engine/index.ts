/**
 * Engine hook - Access and control the current UI engine
 */
import { useContext } from 'react';
import { EngineContext } from '../../providers/engine';
import type { EngineContextValue } from '../../../types';

/**
 * Hook to access the current engine context
 * @throws Error if used outside EngineProvider
 * @returns { engine: EngineName, setEngine: (engine) => void }
 */
export function useEngine(): EngineContextValue {
  const context = useContext(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider');
  }
  return context;
}

// Re-export for backwards compatibility
export { useEngine as useEngineContext };
