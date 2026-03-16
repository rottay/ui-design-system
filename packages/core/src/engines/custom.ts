/**
 * @fileoverview Custom Engine - Rottay Design System
 * @description Pluggable engine system that allows developers to register
 * custom component implementations, overriding default engine behavior.
 *
 * @remarks
 * The Custom engine enables complete component customization:
 *
 * - **Registration**: Add custom implementations for any component
 * - **Fallback**: Gracefully fall back to other engines when not registered
 * - **Configuration**: Customize fallback behavior and logging
 * - **Discovery**: Query registered components and status
 *
 * Use cases:
 * - White-label applications with custom UI
 * - Incremental migration to custom components
 * - A/B testing different implementations
 * - Specialized accessibility implementations
 *
 * @example Register custom component
 * ```tsx
 * import { registerCustomComponent } from '@rottay/design-system';
 *
 * registerCustomComponent('Button', MyCustomButton);
 * registerCustomComponent('Card', MyCustomCard);
 * ```
 *
 * @example Configure Custom Engine
 * ```tsx
 * import { configureCustomEngine } from '@rottay/design-system';
 *
 * configureCustomEngine({
 *   fallbackEngine: 'rustic',
 *   warnOnFallback: false,
 * });
 * ```
 *
 * @example Check registration status
 * ```tsx
 * const { registeredComponents, hasComponent } = useCustomStatus();
 * console.log(registeredComponents); // ['Button', 'Card']
 * ```
 *
 * @see {@link registerCustomComponent} - Register components
 * @see {@link configureCustomEngine} - Configure behavior
 * @see {@link useCustomStatus} - Check status
 * @module System/Engines/Custom
 * @category System
 * @package @rottay/design-system
 */

import type { ComponentType, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';

/**
 * Component registry for custom implementations
 */
type ComponentRegistry = Map<string, ComponentType<unknown>>;

/**
 * Pack-scoped registries of custom engine implementations.
 * Each pack (identified by a string key) has its own independent ComponentRegistry,
 * enabling different tenants to use different component packs in the same runtime.
 *
 * Important distinction:
 * - config is still global (`configureCustomEngine`)
 * - component registrations are pack-scoped
 *
 * That split lets platform teams tune fallback/logging once while still isolating
 * the actual component implementations per tenant or per vertical pack.
 */
const packRegistries: Map<string, ComponentRegistry> = new Map();

/**
 * Default pack key used when no explicit pack is specified.
 * Maintains backward compatibility with code that predates pack-scoped registries.
 */
const DEFAULT_PACK = '__default__';

/**
 * Returns the ComponentRegistry for the given pack, creating one if it doesn't exist.
 */
function getPackRegistry(pack: string): ComponentRegistry {
  let registry = packRegistries.get(pack);
  if (!registry) {
    registry = new Map();
    packRegistries.set(pack, registry);
  }
  return registry;
}

/**
 * Configuration for Custom engine
 */
export interface CustomEngineConfig {
  /** Fallback engine when component is not registered */
  fallbackEngine?: 'classic' | 'modern' | 'rustic';
  /** Whether to warn when using fallback */
  warnOnFallback?: boolean;
  /** Custom logger for debugging */
  logger?: (message: string, level: 'info' | 'warn' | 'error') => void;
}

let customConfig: CustomEngineConfig = {
  fallbackEngine: 'classic',
  warnOnFallback: true,
};

/**
 * Configures the Custom engine globally with custom options.
 * Call this at application startup to customize fallback behavior and logging.
 *
 * @example
 * ```tsx
 * import { configureCustomEngine } from '@rottay/design-system';
 *
 * // Configure at app initialization
 * configureCustomEngine({
 *   fallbackEngine: 'rustic',
 *   warnOnFallback: process.env.NODE_ENV === 'development',
 *   logger: (message, level) => {
 *     if (level === 'error') console.error(message);
 *   }
 * });
 * ```
 *
 * @param config - Partial configuration options to merge with existing config
 */
export function configureCustomEngine(config: Partial<CustomEngineConfig>): void {
  customConfig = { ...customConfig, ...config };
}

/**
 * Returns a copy of the current Custom engine configuration.
 *
 * @example
 * ```tsx
 * import { getCustomEngineConfig } from '@rottay/design-system';
 *
 * const config = getCustomEngineConfig();
 * console.log(config.fallbackEngine); // 'classic'
 * console.log(config.warnOnFallback); // true
 * ```
 *
 * @returns A copy of the current Custom engine configuration object
 */
export function getCustomEngineConfig(): CustomEngineConfig {
  return { ...customConfig };
}

/**
 * Register a custom component implementation
 *
 * @param componentName - The name of the component (e.g., 'Button', 'Alert')
 * @param implementation - The React component implementation
 * @param pack - Optional pack identifier for tenant-scoped registries. Defaults to DEFAULT_PACK.
 *
 * @example
 * ```tsx
 * import { registerCustomComponent } from '@rottay/design-system';
 * import { MyCustomButton } from './MyCustomButton';
 *
 * // Register in default pack
 * registerCustomComponent('Button', MyCustomButton);
 *
 * // Register in a tenant-specific pack
 * registerCustomComponent('Button', AcmeButton, 'acme-pack');
 * ```
 */
export function registerCustomComponent<P>(
  componentName: string,
  implementation: ComponentType<P>,
  pack?: string
): void {
  const packKey = pack ?? DEFAULT_PACK;
  const registry = getPackRegistry(packKey);
  registry.set(componentName, implementation as ComponentType<unknown>);

  if (customConfig.logger) {
    customConfig.logger(`Registered custom component: ${componentName}${pack ? ` [pack: ${pack}]` : ''}`, 'info');
  }
}

/**
 * Register multiple components at once
 *
 * @param components - Object mapping component names to implementations
 * @param pack - Optional pack identifier for tenant-scoped registries
 *
 * @example
 * ```tsx
 * registerCustomComponents({
 *   Button: MyButton,
 *   Alert: MyAlert,
 *   Card: MyCard,
 * });
 *
 * // Register an entire pack for a tenant
 * registerCustomComponents({ Button: AcmeButton, Card: AcmeCard }, 'acme-pack');
 * ```
 */
export function registerCustomComponents(
  components: Record<string, ComponentType<unknown>>,
  pack?: string
): void {
  Object.entries(components).forEach(([name, impl]) => {
    registerCustomComponent(name, impl, pack);
  });
}

/**
 * Removes a custom component from the custom engine registry.
 * After unregistering, the component will fall back to the default engine implementation.
 *
 * @example
 * ```tsx
 * import { unregisterCustomComponent, hasCustomComponent } from '@rottay/design-system';
 *
 * // Remove a custom implementation from default pack
 * const wasRemoved = unregisterCustomComponent('Button');
 * console.log(wasRemoved); // true if it was registered, false otherwise
 *
 * // Remove from a specific pack
 * unregisterCustomComponent('Button', 'acme-pack');
 * ```
 *
 * @param componentName - The name of the component to unregister
 * @param pack - Optional pack identifier. Defaults to DEFAULT_PACK.
 * @returns True if the component was removed, false if it was not registered
 */
export function unregisterCustomComponent(componentName: string, pack?: string): boolean {
  const packKey = pack ?? DEFAULT_PACK;
  const registry = packRegistries.get(packKey);
  if (!registry) return false;

  const result = registry.delete(componentName);

  if (result && customConfig.logger) {
    customConfig.logger(`Unregistered custom component: ${componentName}${pack ? ` [pack: ${pack}]` : ''}`, 'info');
  }

  return result;
}

/**
 * Removes all custom components from the custom engine registry.
 * When called without a pack argument, clears ALL packs. When called with
 * a pack, clears only that pack's registry.
 *
 * @example
 * ```tsx
 * import { clearCustomRegistry, getRegisteredComponentCount } from '@rottay/design-system';
 *
 * // Clear everything (all packs)
 * afterEach(() => {
 *   clearCustomRegistry();
 *   expect(getRegisteredComponentCount()).toBe(0);
 * });
 *
 * // Clear only a specific pack
 * clearCustomRegistry('acme-pack');
 * ```
 *
 * @param pack - Optional pack identifier. If omitted, clears all packs.
 */
export function clearCustomRegistry(pack?: string): void {
  if (pack !== undefined) {
    const registry = packRegistries.get(pack);
    if (registry) {
      registry.clear();
      packRegistries.delete(pack);
    }
  } else {
    packRegistries.clear();
  }

  if (customConfig.logger) {
    customConfig.logger(
      pack ? `Cleared custom components [pack: ${pack}]` : 'Cleared all custom components',
      'info'
    );
  }
}

/**
 * Checks if a component has a custom implementation registered.
 *
 * @example
 * ```tsx
 * import { hasCustomComponent, registerCustomComponent } from '@rottay/design-system';
 *
 * // Check in default pack
 * if (!hasCustomComponent('Button')) {
 *   registerCustomComponent('Button', MyCustomButton);
 * }
 *
 * // Check in a specific pack
 * hasCustomComponent('Button', 'acme-pack');
 * ```
 *
 * @param componentName - The name of the component to check
 * @param pack - Optional pack identifier. Defaults to DEFAULT_PACK.
 * @returns True if the component is registered in the custom engine, false otherwise
 */
export function hasCustomComponent(componentName: string, pack?: string): boolean {
  const packKey = pack ?? DEFAULT_PACK;
  const registry = packRegistries.get(packKey);
  return registry?.has(componentName) ?? false;
}

/**
 * Retrieves a registered custom component implementation from the custom engine registry.
 *
 * @example
 * ```tsx
 * import { getCustomComponent } from '@rottay/design-system';
 *
 * // Get from default pack
 * const CustomButton = getCustomComponent<ButtonProps>('Button');
 *
 * // Get from a specific tenant pack
 * const AcmeButton = getCustomComponent<ButtonProps>('Button', 'acme-pack');
 * ```
 *
 * @param componentName - The name of the component to retrieve
 * @param pack - Optional pack identifier. Defaults to DEFAULT_PACK.
 * @returns The component implementation or undefined if not registered
 */
export function getCustomComponent<P>(
  componentName: string,
  pack?: string
): ComponentType<P> | undefined {
  const packKey = pack ?? DEFAULT_PACK;
  const registry = packRegistries.get(packKey);
  return registry?.get(componentName) as ComponentType<P> | undefined;
}

/**
 * Returns an array of all component names that have custom implementations.
 *
 * @example
 * ```tsx
 * import { getRegisteredComponents } from '@rottay/design-system';
 *
 * // Default pack
 * const components = getRegisteredComponents();
 * console.log(components); // ['Button', 'Input', 'Card']
 *
 * // Specific pack
 * const acmeComponents = getRegisteredComponents('acme-pack');
 * ```
 *
 * @param pack - Optional pack identifier. Defaults to DEFAULT_PACK.
 * @returns Array of registered component names
 */
export function getRegisteredComponents(pack?: string): string[] {
  const packKey = pack ?? DEFAULT_PACK;
  const registry = packRegistries.get(packKey);
  return registry ? Array.from(registry.keys()) : [];
}

/**
 * Returns the number of custom components registered in the custom engine.
 *
 * @example
 * ```tsx
 * import { getRegisteredComponentCount } from '@rottay/design-system';
 *
 * // Default pack count
 * console.log(`${getRegisteredComponentCount()} custom components registered`);
 *
 * // Specific pack count
 * console.log(`${getRegisteredComponentCount('acme-pack')} in acme pack`);
 * ```
 *
 * @param pack - Optional pack identifier. Defaults to DEFAULT_PACK.
 * @returns The count of registered components
 */
export function getRegisteredComponentCount(pack?: string): number {
  const packKey = pack ?? DEFAULT_PACK;
  const registry = packRegistries.get(packKey);
  return registry?.size ?? 0;
}

/**
 * Creates a lazy-loadable wrapper that resolves to either a registered custom
 * component or a fallback implementation.
 * Used internally by the engine factory to support custom component overrides.
 *
 * @example
 * ```tsx
 * import { createCustomWrapper } from '@rottay/design-system';
 *
 * // Internal usage in engine factory
 * const customLoader = createCustomWrapper<ButtonProps>(
 *   'Button',
 *   () => import('./engines/rustic')
 * );
 *
 * // With pack-scoped lookup
 * const customLoader = createCustomWrapper<ButtonProps>(
 *   'Button',
 *   () => import('./engines/rustic'),
 *   'acme-pack'
 * );
 * ```
 *
 * @param componentName - Name of the component to look up in the registry
 * @param getFallback - Function that returns a Promise for the fallback component
 * @param pack - Optional pack identifier for tenant-scoped lookup
 * @returns A function that returns a Promise resolving to the component module
 */
export function createCustomWrapper<P extends object>(
  componentName: string,
  getFallback: () => Promise<{
    default:
      | ComponentType<P>
      | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>>;
  }>,
  pack?: string
): () => Promise<{
  default:
    | ComponentType<P>
    | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>>;
}> {
  return async () => {
    // Resolution is intentionally local to a single pack. The engine factory is
    // responsible for deciding which pack to use based on tenant context.
    const registered = getCustomComponent<P>(componentName, pack);

    if (registered) {
      return { default: registered };
    }

    // Warn about fallback if configured
    if (customConfig.warnOnFallback && customConfig.logger) {
      customConfig.logger(
        `No custom implementation for "${componentName}"${pack ? ` [pack: ${pack}]` : ''}, using ${customConfig.fallbackEngine} fallback`,
        'warn'
      );
    }

    return getFallback();
  };
}

/**
 * Returns a list of all registered pack identifiers.
 *
 * @example
 * ```tsx
 * import { getRegisteredPacks } from '@rottay/design-system';
 *
 * const packs = getRegisteredPacks();
 * console.log(packs); // ['__default__', 'acme-pack', 'globex-pack']
 * ```
 *
 * @returns Array of pack identifiers that have registrations
 */
export function getRegisteredPacks(): string[] {
  return Array.from(packRegistries.keys());
}

/**
 * React hook that provides the current custom engine status.
 * Useful for debugging or building admin interfaces that show component registration.
 *
 * @example
 * ```tsx
 * import { useCustomStatus } from '@rottay/design-system';
 *
 * function CustomEngineDebugPanel() {
 *   const { registeredComponents, componentCount, config, hasComponent } = useCustomStatus();
 *
 *   return (
 *     <div>
 *       <p>Registered: {componentCount} components</p>
 *       <p>Fallback: {config.fallbackEngine}</p>
 *       <ul>
 *         {registeredComponents.map(name => (
 *           <li key={name}>{name}</li>
 *         ))}
 *       </ul>
 *       <p>Has Button: {hasComponent('Button') ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param pack - Optional pack identifier for scoped status
 * @returns Object containing custom engine status and utility functions
 */
export function useCustomStatus(pack?: string) {
  // This hook is intentionally read-only. Registration happens through the
  // imperative API so apps can wire packs during bootstrap or lazy module load.
  return {
    registeredComponents: getRegisteredComponents(pack),
    componentCount: getRegisteredComponentCount(pack),
    config: getCustomEngineConfig(),
    hasComponent: (name: string) => hasCustomComponent(name, pack),
    packs: getRegisteredPacks(),
  };
}
