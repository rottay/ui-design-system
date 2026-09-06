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
 * - `classic`: Ant Design - shipped, FROZEN, not admitted
 * - `modern`: Rottay-native premium skin - the one productive engine
 * - `rustic`: Vanilla - shipped, FROZEN, not admitted
 * - `custom`: Pluggable - resolved from a registered pack
 *
 * `status` is what the package SHIPS; whether an engine may be SELECTED is
 * answered once by `ADMITTED_ENGINE_NAMES` in the identity contract.
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

import {
  ENGINE_NAMES,
  FROZEN_ENGINE_NAMES,
  isValidEngineName,
} from '../../../../../foundation/contracts/kernel/engine-identity';
import type { EngineName, EngineConfig } from '../../../../../foundation/contracts';

/** The roster, republished so consumers derive instead of restating it. */
export {
  ADMITTED_ENGINE_NAMES,
  ENGINE_NAMES,
  EXTENSION_ENGINE,
  FROZEN_ENGINE_NAMES,
  IMPLEMENTED_ENGINE_NAMES,
  isAdmittedEngineName,
  isFrozenEngineName,
  isImplementedEngineName,
} from '../../../../../foundation/contracts/kernel/engine-identity';
export type { ImplementedEngineName } from '../../../../../foundation/contracts/kernel/engine-identity';

/**
 * Registry of all available engines
 *
 * Engines:
 * - classic: Ant Design - Enterprise, structured, corporate feel (frozen)
 * - modern: Rottay-native premium skin - the one productive engine
 * - rustic: Pure HTML/CSS - Minimal, spacious, understated (frozen)
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
  return [...ENGINE_NAMES];
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
  return isValidEngineName(name);
};

/** The engines a tenant, an intent or a runtime may select. */
export const getAdmittedEngines = (): EngineName[] => {
  return getAvailableEngines().filter((name) => !FROZEN_ENGINE_NAMES.includes(name));
};

/** Shipped for compatibility, closed to content work and to admission. */
export const getFrozenEngines = (): EngineName[] => {
  return getAvailableEngines().filter((name) => FROZEN_ENGINE_NAMES.includes(name));
};
