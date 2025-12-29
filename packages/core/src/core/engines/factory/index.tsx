/**
 * @fileoverview Engine Component Factory - Rottay Design System
 * @description Factory function for creating engine-aware components that
 * dynamically load implementations based on the current engine context.
 *
 * @remarks
 * The factory enables the multi-engine architecture by:
 *
 * - **Lazy loading**: Code-splits engine implementations
 * - **Context-aware**: Respects EngineProvider settings
 * - **Override support**: Per-component engine override via prop
 * - **Error handling**: Built-in error boundary with fallbacks
 * - **Athena support**: Custom component registration
 *
 * @example Creating a component
 * ```tsx
 * export const Button = createEngineComponent<ButtonProps>('Button', {
 *   titan: () => import('./engines/titan'),
 *   hermes: () => import('./engines/hermes'),
 *   apollo: () => import('./engines/apollo'),
 * });
 * ```
 *
 * @example With options
 * ```tsx
 * export const Card = createEngineComponent('Card', loaders, {
 *   fallback: <Skeleton />,
 *   fallbackEngine: 'apollo',
 *   onError: (error) => logError(error),
 * });
 * ```
 *
 * @see {@link EngineLoaders} - Loader configuration
 * @see {@link CreateEngineComponentOptions} - Factory options
 * @module System/Engines/Factory
 * @category System
 * @package @rottay/design-system
 */

import { lazy, Suspense, ComponentType, LazyExoticComponent, ErrorInfo } from 'react';
import { useEngineContext } from '../../providers/engine';
import { createAthenaWrapper } from '../athena';
import { EngineErrorBoundary } from '../boundary';
import type { EngineName } from '../../types';

/**
 * Configuration object containing dynamic import functions for each engine.
 * Each loader must return a Promise that resolves to a module with a default export.
 *
 * @example
 * ```tsx
 * const buttonLoaders: EngineLoaders<ButtonProps> = {
 *   titan: () => import('./engines/titan'),
 *   hermes: () => import('./engines/hermes'),
 *   apollo: () => import('./engines/apollo'),
 *   // Optional: custom Athena loader
 *   athena: () => import('./engines/athena'),
 * };
 * ```
 */
export interface EngineLoaders<P> {
  /** Loader for Titan engine (Ant Design) */
  titan: () => Promise<{ default: ComponentType<P> }>;
  /** Loader for Hermes engine (DaisyUI/Tailwind) */
  hermes: () => Promise<{ default: ComponentType<P> }>;
  /** Loader for Apollo engine (Vanilla HTML/CSS) */
  apollo: () => Promise<{ default: ComponentType<P> }>;
  /** Optional loader for Athena engine (custom implementations) */
  athena?: () => Promise<{ default: ComponentType<P> }>;
}

/**
 * Optional configuration for customizing engine component behavior.
 *
 * @example
 * ```tsx
 * const options: CreateEngineComponentOptions = {
 *   fallback: <Skeleton />,
 *   athenaEnabled: true,
 *   fallbackEngine: 'apollo',
 *   onError: (error, errorInfo) => {
 *     console.error('Component failed to load:', error);
 *     logToService(errorInfo);
 *   }
 * };
 * ```
 */
export interface CreateEngineComponentOptions {
  /** Custom fallback UI displayed while the component is lazy loading */
  fallback?: React.ReactNode;
  /** Whether to wrap with Athena for custom component support (default: true) */
  athenaEnabled?: boolean;
  /** Fallback engine to use if the primary engine fails to load */
  fallbackEngine?: EngineName;
  /** Callback invoked when engine loading encounters an error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Creates an engine-aware component that dynamically loads the appropriate
 * implementation based on the current engine context or component-level override.
 *
 * This factory function enables the multi-engine architecture by:
 * - Lazy-loading engine implementations for code-splitting
 * - Respecting the EngineProvider context for global engine selection
 * - Allowing per-component engine overrides via the `engine` prop
 * - Wrapping components with error boundaries for graceful failure handling
 * - Supporting Athena's pluggable component system
 *
 * @example
 * ```tsx
 * import { createEngineComponent } from '@rottay/design-system';
 * import type { ButtonProps } from './types';
 *
 * // Create an engine-aware Button component
 * export const Button = createEngineComponent<ButtonProps>('Button', {
 *   titan: () => import('./engines/titan'),
 *   hermes: () => import('./engines/hermes'),
 *   apollo: () => import('./engines/apollo'),
 * });
 *
 * // Usage with default engine (from provider)
 * <Button variant="primary">Click me</Button>
 *
 * // Usage with engine override
 * <Button engine="hermes" variant="primary">Click me</Button>
 *
 * // With custom options
 * export const Card = createEngineComponent<CardProps>('Card', loaders, {
 *   fallback: <Skeleton />,
 *   fallbackEngine: 'apollo',
 *   onError: (error) => logError('Card loading failed', error)
 * });
 * ```
 *
 * @param displayName - Component name used for React DevTools and debugging
 * @param loaders - Object containing dynamic import functions for each engine
 * @param options - Optional configuration for loading behavior and error handling
 * @returns A React component that renders the appropriate engine implementation
 */
export function createEngineComponent<P extends object>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options: CreateEngineComponentOptions = {}
): ComponentType<P> {
  const { fallback = null, athenaEnabled = true, fallbackEngine, onError } = options;

  // Create Athena wrapper that checks for registered components
  const athenaLoader = athenaEnabled
    ? createAthenaWrapper<P>(displayName, loaders.athena || loaders.apollo)
    : (loaders.athena || loaders.apollo);

  // Create lazy components for each engine
  const components: Record<EngineName, LazyExoticComponent<ComponentType<P>>> = {
    titan: lazy(loaders.titan),
    hermes: lazy(loaders.hermes),
    apollo: lazy(loaders.apollo),
    athena: lazy(athenaLoader),
  };

  // Create the router component
  const EngineRouter = (props: P & { engine?: EngineName }) => {
    const context = useEngineContext();
    // Allow engine prop to override context engine
    const activeEngine = props.engine || context.engine;
    const Component = components[activeEngine];

    // Remove engine prop before passing to implementation
    const { engine: _, ...componentProps } = props;

    return (
      <EngineErrorBoundary
        fallbackEngine={fallbackEngine}
        onError={onError}
      >
        <Suspense fallback={fallback}>
          <Component {...(componentProps as any)} />
        </Suspense>
      </EngineErrorBoundary>
    );
  };

  EngineRouter.displayName = displayName;

  return EngineRouter;
}
