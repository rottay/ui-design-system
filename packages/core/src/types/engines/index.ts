/**
 * Engine type definitions
 * Engines are wrappers for 3rd party UI libraries
 */

export type EngineName = 'titan' | 'hermes' | 'apollo' | 'athena';

export interface EngineConfig {
  name: EngineName;
  displayName: string;
  library: string;
  status: 'stable' | 'beta' | 'experimental';
}

export interface EngineContextValue {
  engine: EngineName;
  setEngine: (engine: EngineName) => void;
}
