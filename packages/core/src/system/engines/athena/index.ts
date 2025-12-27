/**
 * Athena - Pluggable Engine System
 *
 * Allows developers to register custom component implementations
 * that override the default engine behavior.
 */

import type { ComponentType } from 'react';

/**
 * Component registry for custom implementations
 */
type ComponentRegistry = Map<string, ComponentType<unknown>>;

/**
 * Global registry of custom Athena implementations
 */
const athenaRegistry: ComponentRegistry = new Map();

/**
 * Configuration for Athena engine
 */
export interface AthenaConfig {
  /** Fallback engine when component is not registered */
  fallbackEngine?: 'titan' | 'hermes' | 'apollo';
  /** Whether to warn when using fallback */
  warnOnFallback?: boolean;
  /** Custom logger for debugging */
  logger?: (message: string, level: 'info' | 'warn' | 'error') => void;
}

let athenaConfig: AthenaConfig = {
  fallbackEngine: 'titan',
  warnOnFallback: true,
};

/**
 * Configures the Athena engine globally with custom options.
 * Call this at application startup to customize fallback behavior and logging.
 *
 * @example
 * ```tsx
 * import { configureAthena } from '@rottay/design-system';
 *
 * // Configure at app initialization
 * configureAthena({
 *   fallbackEngine: 'apollo',
 *   warnOnFallback: process.env.NODE_ENV === 'development',
 *   logger: (message, level) => {
 *     if (level === 'error') console.error(message);
 *   }
 * });
 * ```
 *
 * @param config - Partial configuration options to merge with existing config
 */
export function configureAthena(config: Partial<AthenaConfig>): void {
  athenaConfig = { ...athenaConfig, ...config };
}

/**
 * Returns a copy of the current Athena engine configuration.
 *
 * @example
 * ```tsx
 * import { getAthenaConfig } from '@rottay/design-system';
 *
 * const config = getAthenaConfig();
 * console.log(config.fallbackEngine); // 'titan'
 * console.log(config.warnOnFallback); // true
 * ```
 *
 * @returns A copy of the current Athena configuration object
 */
export function getAthenaConfig(): AthenaConfig {
  return { ...athenaConfig };
}

/**
 * Register a custom component implementation
 *
 * @param componentName - The name of the component (e.g., 'Button', 'Alert')
 * @param implementation - The React component implementation
 *
 * @example
 * ```tsx
 * import { registerAthenaComponent } from '@rottay/design-system';
 * import { MyCustomButton } from './MyCustomButton';
 *
 * registerAthenaComponent('Button', MyCustomButton);
 * ```
 */
export function registerAthenaComponent<P>(
  componentName: string,
  implementation: ComponentType<P>
): void {
  athenaRegistry.set(componentName, implementation as ComponentType<unknown>);

  if (athenaConfig.logger) {
    athenaConfig.logger(`Registered Athena component: ${componentName}`, 'info');
  }
}

/**
 * Register multiple components at once
 *
 * @param components - Object mapping component names to implementations
 *
 * @example
 * ```tsx
 * registerAthenaComponents({
 *   Button: MyButton,
 *   Alert: MyAlert,
 *   Card: MyCard,
 * });
 * ```
 */
export function registerAthenaComponents(
  components: Record<string, ComponentType<unknown>>
): void {
  Object.entries(components).forEach(([name, impl]) => {
    registerAthenaComponent(name, impl);
  });
}

/**
 * Removes a custom component from the Athena registry.
 * After unregistering, the component will fall back to the default engine implementation.
 *
 * @example
 * ```tsx
 * import { unregisterAthenaComponent, hasAthenaComponent } from '@rottay/design-system';
 *
 * // Remove a custom implementation
 * const wasRemoved = unregisterAthenaComponent('Button');
 * console.log(wasRemoved); // true if it was registered, false otherwise
 *
 * // Verify removal
 * console.log(hasAthenaComponent('Button')); // false
 * ```
 *
 * @param componentName - The name of the component to unregister
 * @returns True if the component was removed, false if it was not registered
 */
export function unregisterAthenaComponent(componentName: string): boolean {
  const result = athenaRegistry.delete(componentName);

  if (result && athenaConfig.logger) {
    athenaConfig.logger(`Unregistered Athena component: ${componentName}`, 'info');
  }

  return result;
}

/**
 * Removes all custom components from the Athena registry.
 * Useful for testing or when switching contexts.
 *
 * @example
 * ```tsx
 * import { clearAthenaRegistry, getRegisteredComponentCount } from '@rottay/design-system';
 *
 * // In test cleanup
 * afterEach(() => {
 *   clearAthenaRegistry();
 *   expect(getRegisteredComponentCount()).toBe(0);
 * });
 * ```
 */
export function clearAthenaRegistry(): void {
  athenaRegistry.clear();

  if (athenaConfig.logger) {
    athenaConfig.logger('Cleared all Athena components', 'info');
  }
}

/**
 * Checks if a component has a custom Athena implementation registered.
 *
 * @example
 * ```tsx
 * import { hasAthenaComponent, registerAthenaComponent } from '@rottay/design-system';
 *
 * // Check before registering to avoid duplicates
 * if (!hasAthenaComponent('Button')) {
 *   registerAthenaComponent('Button', MyCustomButton);
 * }
 *
 * // Conditionally render based on availability
 * const ButtonImpl = hasAthenaComponent('Button')
 *   ? getAthenaComponent('Button')
 *   : DefaultButton;
 * ```
 *
 * @param componentName - The name of the component to check
 * @returns True if the component is registered in Athena, false otherwise
 */
export function hasAthenaComponent(componentName: string): boolean {
  return athenaRegistry.has(componentName);
}

/**
 * Retrieves a registered custom component implementation from the Athena registry.
 *
 * @example
 * ```tsx
 * import { getAthenaComponent } from '@rottay/design-system';
 *
 * // Get a registered component with type safety
 * interface ButtonProps {
 *   label: string;
 *   onClick: () => void;
 * }
 *
 * const CustomButton = getAthenaComponent<ButtonProps>('Button');
 * if (CustomButton) {
 *   return <CustomButton label="Click me" onClick={handleClick} />;
 * }
 * ```
 *
 * @param componentName - The name of the component to retrieve
 * @returns The component implementation or undefined if not registered
 */
export function getAthenaComponent<P>(
  componentName: string
): ComponentType<P> | undefined {
  return athenaRegistry.get(componentName) as ComponentType<P> | undefined;
}

/**
 * Returns an array of all component names that have custom Athena implementations.
 *
 * @example
 * ```tsx
 * import { getRegisteredComponents } from '@rottay/design-system';
 *
 * const components = getRegisteredComponents();
 * console.log(components); // ['Button', 'Input', 'Card']
 *
 * // Display in a debug panel
 * <DebugPanel>
 *   <h3>Custom Components:</h3>
 *   <ul>
 *     {getRegisteredComponents().map(name => (
 *       <li key={name}>{name}</li>
 *     ))}
 *   </ul>
 * </DebugPanel>
 * ```
 *
 * @returns Array of registered component names
 */
export function getRegisteredComponents(): string[] {
  return Array.from(athenaRegistry.keys());
}

/**
 * Returns the number of custom components registered in Athena.
 *
 * @example
 * ```tsx
 * import { getRegisteredComponentCount } from '@rottay/design-system';
 *
 * console.log(`${getRegisteredComponentCount()} custom components registered`);
 *
 * // Use in tests
 * expect(getRegisteredComponentCount()).toBe(3);
 * ```
 *
 * @returns The count of registered components
 */
export function getRegisteredComponentCount(): number {
  return athenaRegistry.size;
}

/**
 * Creates a lazy-loadable wrapper that resolves to either a registered Athena
 * component or a fallback implementation.
 * Used internally by the engine factory to support custom component overrides.
 *
 * @example
 * ```tsx
 * import { createAthenaWrapper } from '@rottay/design-system';
 *
 * // Internal usage in engine factory
 * const athenaLoader = createAthenaWrapper<ButtonProps>(
 *   'Button',
 *   () => import('./engines/apollo')
 * );
 *
 * // The wrapper returns a Promise for lazy loading
 * const { default: ButtonComponent } = await athenaLoader();
 * ```
 *
 * @param componentName - Name of the component to look up in the registry
 * @param getFallback - Function that returns a Promise for the fallback component
 * @returns A function that returns a Promise resolving to the component module
 */
export function createAthenaWrapper<P extends object>(
  componentName: string,
  getFallback: () => Promise<{ default: ComponentType<P> }>
): () => Promise<{ default: ComponentType<P> }> {
  return async () => {
    const registered = getAthenaComponent<P>(componentName);

    if (registered) {
      return { default: registered };
    }

    // Warn about fallback if configured
    if (athenaConfig.warnOnFallback && athenaConfig.logger) {
      athenaConfig.logger(
        `No Athena implementation for "${componentName}", using ${athenaConfig.fallbackEngine} fallback`,
        'warn'
      );
    }

    return getFallback();
  };
}

/**
 * React hook that provides the current Athena engine status.
 * Useful for debugging or building admin interfaces that show component registration.
 *
 * @example
 * ```tsx
 * import { useAthenaStatus } from '@rottay/design-system';
 *
 * function AthenaDebugPanel() {
 *   const { registeredComponents, componentCount, config, hasComponent } = useAthenaStatus();
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
 * @returns Object containing Athena status and utility functions
 */
export function useAthenaStatus() {
  return {
    registeredComponents: getRegisteredComponents(),
    componentCount: getRegisteredComponentCount(),
    config: getAthenaConfig(),
    hasComponent: hasAthenaComponent,
  };
}
