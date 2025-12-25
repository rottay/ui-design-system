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
 * Configure the Athena engine globally
 * @param config - Configuration options
 */
export function configureAthena(config: Partial<AthenaConfig>): void {
  athenaConfig = { ...athenaConfig, ...config };
}

/**
 * Get current Athena configuration
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
 * Unregister a custom component
 * @param componentName - The component to unregister
 */
export function unregisterAthenaComponent(componentName: string): boolean {
  const result = athenaRegistry.delete(componentName);

  if (result && athenaConfig.logger) {
    athenaConfig.logger(`Unregistered Athena component: ${componentName}`, 'info');
  }

  return result;
}

/**
 * Clear all registered Athena components
 */
export function clearAthenaRegistry(): void {
  athenaRegistry.clear();

  if (athenaConfig.logger) {
    athenaConfig.logger('Cleared all Athena components', 'info');
  }
}

/**
 * Check if a component is registered
 * @param componentName - The component name to check
 */
export function hasAthenaComponent(componentName: string): boolean {
  return athenaRegistry.has(componentName);
}

/**
 * Get a registered component implementation
 * @param componentName - The component name to retrieve
 * @returns The component or undefined if not registered
 */
export function getAthenaComponent<P>(
  componentName: string
): ComponentType<P> | undefined {
  return athenaRegistry.get(componentName) as ComponentType<P> | undefined;
}

/**
 * Get all registered component names
 */
export function getRegisteredComponents(): string[] {
  return Array.from(athenaRegistry.keys());
}

/**
 * Get the count of registered components
 */
export function getRegisteredComponentCount(): number {
  return athenaRegistry.size;
}

/**
 * Create an Athena component wrapper that uses registered implementation
 * or falls back to a default
 *
 * @param componentName - Name of the component
 * @param getFallback - Function to get the fallback component
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
 * React hook to check if running with Athena engine
 * and if specific components are available
 */
export function useAthenaStatus() {
  return {
    registeredComponents: getRegisteredComponents(),
    componentCount: getRegisteredComponentCount(),
    config: getAthenaConfig(),
    hasComponent: hasAthenaComponent,
  };
}
