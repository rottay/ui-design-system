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
 * Global registry of custom engine implementations
 */
const customRegistry: ComponentRegistry = new Map();

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
 *
 * @example
 * ```tsx
 * import { registerCustomComponent } from '@rottay/design-system';
 * import { MyCustomButton } from './MyCustomButton';
 *
 * registerCustomComponent('Button', MyCustomButton);
 * ```
 */
export function registerCustomComponent<P>(
  componentName: string,
  implementation: ComponentType<P>
): void {
  customRegistry.set(componentName, implementation as ComponentType<unknown>);

  if (customConfig.logger) {
    customConfig.logger(`Registered custom component: ${componentName}`, 'info');
  }
}

/**
 * Register multiple components at once
 *
 * @param components - Object mapping component names to implementations
 *
 * @example
 * ```tsx
 * registerCustomComponents({
 *   Button: MyButton,
 *   Alert: MyAlert,
 *   Card: MyCard,
 * });
 * ```
 */
export function registerCustomComponents(
  components: Record<string, ComponentType<unknown>>
): void {
  Object.entries(components).forEach(([name, impl]) => {
    registerCustomComponent(name, impl);
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
 * // Remove a custom implementation
 * const wasRemoved = unregisterCustomComponent('Button');
 * console.log(wasRemoved); // true if it was registered, false otherwise
 *
 * // Verify removal
 * console.log(hasCustomComponent('Button')); // false
 * ```
 *
 * @param componentName - The name of the component to unregister
 * @returns True if the component was removed, false if it was not registered
 */
export function unregisterCustomComponent(componentName: string): boolean {
  const result = customRegistry.delete(componentName);

  if (result && customConfig.logger) {
    customConfig.logger(`Unregistered custom component: ${componentName}`, 'info');
  }

  return result;
}

/**
 * Removes all custom components from the custom engine registry.
 * Useful for testing or when switching contexts.
 *
 * @example
 * ```tsx
 * import { clearCustomRegistry, getRegisteredComponentCount } from '@rottay/design-system';
 *
 * // In test cleanup
 * afterEach(() => {
 *   clearCustomRegistry();
 *   expect(getRegisteredComponentCount()).toBe(0);
 * });
 * ```
 */
export function clearCustomRegistry(): void {
  customRegistry.clear();

  if (customConfig.logger) {
    customConfig.logger('Cleared all custom components', 'info');
  }
}

/**
 * Checks if a component has a custom implementation registered.
 *
 * @example
 * ```tsx
 * import { hasCustomComponent, registerCustomComponent } from '@rottay/design-system';
 *
 * // Check before registering to avoid duplicates
 * if (!hasCustomComponent('Button')) {
 *   registerCustomComponent('Button', MyCustomButton);
 * }
 *
 * // Conditionally render based on availability
 * const ButtonImpl = hasCustomComponent('Button')
 *   ? getCustomComponent('Button')
 *   : DefaultButton;
 * ```
 *
 * @param componentName - The name of the component to check
 * @returns True if the component is registered in the custom engine, false otherwise
 */
export function hasCustomComponent(componentName: string): boolean {
  return customRegistry.has(componentName);
}

/**
 * Retrieves a registered custom component implementation from the custom engine registry.
 *
 * @example
 * ```tsx
 * import { getCustomComponent } from '@rottay/design-system';
 *
 * // Get a registered component with type safety
 * interface ButtonProps {
 *   label: string;
 *   onClick: () => void;
 * }
 *
 * const CustomButton = getCustomComponent<ButtonProps>('Button');
 * if (CustomButton) {
 *   return <CustomButton label="Click me" onClick={handleClick} />;
 * }
 * ```
 *
 * @param componentName - The name of the component to retrieve
 * @returns The component implementation or undefined if not registered
 */
export function getCustomComponent<P>(
  componentName: string
): ComponentType<P> | undefined {
  return customRegistry.get(componentName) as ComponentType<P> | undefined;
}

/**
 * Returns an array of all component names that have custom implementations.
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
  return Array.from(customRegistry.keys());
}

/**
 * Returns the number of custom components registered in the custom engine.
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
  return customRegistry.size;
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
 * // The wrapper returns a Promise for lazy loading
 * const { default: ButtonComponent } = await customLoader();
 * ```
 *
 * @param componentName - Name of the component to look up in the registry
 * @param getFallback - Function that returns a Promise for the fallback component
 * @returns A function that returns a Promise resolving to the component module
 */
export function createCustomWrapper<P extends object>(
  componentName: string,
  getFallback: () => Promise<{
    default:
      | ComponentType<P>
      | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>>;
  }>
): () => Promise<{
  default:
    | ComponentType<P>
    | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>>;
}> {
  return async () => {
    const registered = getCustomComponent<P>(componentName);

    if (registered) {
      return { default: registered };
    }

    // Warn about fallback if configured
    if (customConfig.warnOnFallback && customConfig.logger) {
      customConfig.logger(
        `No custom implementation for "${componentName}", using ${customConfig.fallbackEngine} fallback`,
        'warn'
      );
    }

    return getFallback();
  };
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
 * @returns Object containing custom engine status and utility functions
 */
export function useCustomStatus() {
  return {
    registeredComponents: getRegisteredComponents(),
    componentCount: getRegisteredComponentCount(),
    config: getCustomEngineConfig(),
    hasComponent: hasCustomComponent,
  };
}
