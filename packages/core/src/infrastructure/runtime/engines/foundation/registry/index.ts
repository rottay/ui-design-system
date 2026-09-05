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
 *
 * Available engines:
 * - `classic`: Ant Design (stable) - Enterprise, structured
 * - `modern`: Rottay-native premium skin (stable) - the primary engine
 * - `rustic`: Vanilla (stable) - Minimal, spacious
 * - `custom`: Pluggable (experimental) - resolved from a registered pack
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

import type { EngineName, EngineConfig } from '../../../../../foundation/contracts';

/**
 * Registry of all available engines
 *
 * Engines:
 * - classic: Ant Design - Enterprise, structured, corporate feel
 * - modern: Rottay-native premium skin - the primary engine
 * - rustic: Pure HTML/CSS - Minimal, spacious, understated
 * - custom: Pluggable - resolved from a registered component pack
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
    displayName: 'Modern',
    library: 'rottay-native',
    status: 'stable',
  },
  rustic: {
    name: 'rustic',
    displayName: 'Rustic (HTML)',
    library: 'html',
    status: 'stable',
  },
  custom: {
    name: 'custom',
    displayName: 'Custom (Pluggable)',
    library: 'custom',
    status: 'experimental',
  },
};

/**
 * Retrieves the configuration for a specific engine by name.
 *
 * @param name - The engine name ('classic', 'modern', 'rustic', or 'custom')
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
