/**
 * Engine Registry
 * Central registry of all available UI engine implementations
 */

import type { EngineName, EngineConfig } from '../../../types';

/**
 * Registry of all available engines
 *
 * Engines:
 * - titan: Ant Design - Full-featured enterprise UI
 * - hermes: DaisyUI/Tailwind - Utility-first styling
 * - apollo: Pure HTML/CSS - Minimal, framework-agnostic
 * - athena: Pluggable - Custom implementation support
 */
export const ENGINE_REGISTRY: Record<EngineName, EngineConfig> = {
  titan: {
    name: 'titan',
    displayName: 'Titan (Ant Design)',
    library: 'antd',
    status: 'stable',
  },
  hermes: {
    name: 'hermes',
    displayName: 'Hermes (DaisyUI)',
    library: 'daisyui',
    status: 'stable',
  },
  apollo: {
    name: 'apollo',
    displayName: 'Apollo (HTML)',
    library: 'html',
    status: 'stable',
  },
  athena: {
    name: 'athena',
    displayName: 'Athena (Pluggable)',
    library: 'custom',
    status: 'experimental',
  },
};

/**
 * Get engine configuration by name
 * @param name - The engine name
 * @returns The engine configuration
 */
export const getEngine = (name: EngineName): EngineConfig => {
  return ENGINE_REGISTRY[name];
};

/**
 * Get list of all available engine names
 * @returns Array of engine names
 */
export const getAvailableEngines = (): EngineName[] => {
  return Object.keys(ENGINE_REGISTRY) as EngineName[];
};

/**
 * Get list of stable engines only
 * @returns Array of stable engine names
 */
export const getStableEngines = (): EngineName[] => {
  return getAvailableEngines().filter(
    (name) => ENGINE_REGISTRY[name].status === 'stable'
  );
};

/**
 * Check if a string is a valid engine name
 * @param name - String to validate
 * @returns Type guard for EngineName
 */
export const isValidEngine = (name: string): name is EngineName => {
  return name in ENGINE_REGISTRY;
};

/**
 * Get the default engine
 * @returns The default engine name
 */
export const getDefaultEngine = (): EngineName => {
  return 'titan';
};
