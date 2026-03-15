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
 * - `classic`: Ant Design (stable) - Enterprise, structured
 * - `modern`: DaisyUI (stable) - Contemporary, rounded
 * - `rustic`: Vanilla (stable) - Minimal, spacious
 * - `athena`: Pluggable (experimental) - Custom implementations
 *
 * @example Get engine info
 * ```tsx
 * const config = getEngine('classic');
 * console.log(config.displayName); // 'Classic (Ant Design)'
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

import type { EngineName, EngineConfig } from '../contracts';

/**
 * Registry of all available engines
 *
 * Engines:
 * - classic: Ant Design - Enterprise, structured, corporate feel
 * - modern: DaisyUI/Tailwind - Contemporary, rounded, glassmorphism
 * - rustic: Pure HTML/CSS - Minimal, spacious, understated
 * - athena: Pluggable - Custom implementation support
 */
export const ENGINE_REGISTRY: Record<EngineName, EngineConfig> = {
  classic: {
    name: 'classic',
    displayName: 'Classic (Ant Design)',
    library: 'antd',
    status: 'stable',
  },
  modern: {
    name: 'modern',
    displayName: 'Modern (DaisyUI)',
    library: 'daisyui',
    status: 'stable',
  },
  rustic: {
    name: 'rustic',
    displayName: 'Rustic (HTML)',
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
 * @param name - The engine name ('classic', 'modern', 'rustic', or 'athena')
 * @returns The engine configuration object containing name, displayName, library, and status
 */
export const getEngine = (name: EngineName): EngineConfig => {
  return ENGINE_REGISTRY[name];
};

/**
 * Returns a list of all available engine names in the design system.
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
 * @returns Array of engine names with 'stable' status
 */
export const getStableEngines = (): EngineName[] => {
  return getAvailableEngines().filter(
    (name) => ENGINE_REGISTRY[name].status === 'stable'
  );
};

/**
 * Type guard to check if a string is a valid engine name.
 *
 * @param name - String value to validate as an engine name
 * @returns True if the name is a valid EngineName, false otherwise
 */
export const isValidEngine = (name: string): name is EngineName => {
  return name in ENGINE_REGISTRY;
};

/**
 * Returns the default engine used when no engine is specified.
 * Currently defaults to 'classic' (Ant Design).
 *
 * @returns The default engine name ('classic')
 */
export const getDefaultEngine = (): EngineName => {
  return 'classic';
};
