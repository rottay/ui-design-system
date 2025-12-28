/**
 * @fileoverview Engine Registry - Rottay Design System
 * @description Central registry containing metadata and utilities for all
 * available UI rendering engines in the design system.
 *
 * @remarks
 * The registry provides:
 * - **Engine metadata**: Names, display names, libraries, status
 * - **Validation**: Type guards for engine names
 * - **Discovery**: List available and stable engines
 * - **Defaults**: Get default engine configuration
 *
 * Available engines:
 * - `titan`: Ant Design (stable) - Full-featured
 * - `hermes`: DaisyUI (stable) - Lightweight
 * - `apollo`: Vanilla (stable) - Zero dependencies
 * - `athena`: Pluggable (experimental) - Custom implementations
 *
 * @example Get engine info
 * ```tsx
 * const config = getEngine('titan');
 * console.log(config.displayName); // 'Titan (Ant Design)'
 * ```
 *
 * @example Validate engine name
 * ```tsx
 * if (isValidEngine(userInput)) {
 *   setEngine(userInput);
 * }
 * ```
 *
 * @see {@link ENGINE_REGISTRY} - Engine definitions
 * @see {@link getEngine} - Get engine config
 * @see {@link isValidEngine} - Validate engine name
 * @module System/Engines/Registry
 * @category System
 * @package @rottay/design-system
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
 * Retrieves the configuration for a specific engine by name.
 *
 * @example
 * ```tsx
 * import { getEngine } from '@rottay/design-system';
 *
 * const titanConfig = getEngine('titan');
 * console.log(titanConfig.displayName); // 'Titan (Ant Design)'
 * console.log(titanConfig.status); // 'stable'
 * ```
 *
 * @param name - The engine name ('titan', 'hermes', 'apollo', or 'athena')
 * @returns The engine configuration object containing name, displayName, library, and status
 */
export const getEngine = (name: EngineName): EngineConfig => {
  return ENGINE_REGISTRY[name];
};

/**
 * Returns a list of all available engine names in the design system.
 *
 * @example
 * ```tsx
 * import { getAvailableEngines } from '@rottay/design-system';
 *
 * const engines = getAvailableEngines();
 * // ['titan', 'hermes', 'apollo', 'athena']
 *
 * // Use in a select dropdown
 * <Select options={engines.map(e => ({ value: e, label: e }))} />
 * ```
 *
 * @returns Array of all engine names including experimental ones
 */
export const getAvailableEngines = (): EngineName[] => {
  return Object.keys(ENGINE_REGISTRY) as EngineName[];
};

/**
 * Returns only the production-ready (stable) engines.
 * Excludes experimental or deprecated engines.
 *
 * @example
 * ```tsx
 * import { getStableEngines } from '@rottay/design-system';
 *
 * const stableEngines = getStableEngines();
 * // ['titan', 'hermes', 'apollo'] - excludes 'athena' (experimental)
 *
 * // Show only stable options to users
 * const engineOptions = stableEngines.map(engine => ({
 *   value: engine,
 *   label: getEngine(engine).displayName
 * }));
 * ```
 *
 * @returns Array of engine names with 'stable' status
 */
export const getStableEngines = (): EngineName[] => {
  return getAvailableEngines().filter(
    (name) => ENGINE_REGISTRY[name].status === 'stable'
  );
};

/**
 * Type guard to check if a string is a valid engine name.
 * Useful for validating user input or configuration values.
 *
 * @example
 * ```tsx
 * import { isValidEngine } from '@rottay/design-system';
 *
 * function setEngine(engineName: string) {
 *   if (isValidEngine(engineName)) {
 *     // TypeScript knows engineName is EngineName here
 *     return getEngine(engineName);
 *   }
 *   throw new Error(`Invalid engine: ${engineName}`);
 * }
 *
 * // Validate URL parameter
 * const urlEngine = searchParams.get('engine');
 * if (urlEngine && isValidEngine(urlEngine)) {
 *   useEngine(urlEngine);
 * }
 * ```
 *
 * @param name - String value to validate as an engine name
 * @returns True if the name is a valid EngineName, false otherwise
 */
export const isValidEngine = (name: string): name is EngineName => {
  return name in ENGINE_REGISTRY;
};

/**
 * Returns the default engine used when no engine is specified.
 * Currently defaults to 'titan' (Ant Design).
 *
 * @example
 * ```tsx
 * import { getDefaultEngine, EngineProvider } from '@rottay/design-system';
 *
 * // Use default engine for the provider
 * <EngineProvider defaultEngine={getDefaultEngine()}>
 *   <App />
 * </EngineProvider>
 *
 * // Check if user has overridden the default
 * const userEngine = localStorage.getItem('preferredEngine');
 * const engine = userEngine || getDefaultEngine();
 * ```
 *
 * @returns The default engine name ('titan')
 */
export const getDefaultEngine = (): EngineName => {
  return 'titan';
};
