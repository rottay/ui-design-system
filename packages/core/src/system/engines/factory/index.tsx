/**
 * Engine Component Factory
 * Creates engine-aware components that dynamically load implementations
 */

import { lazy, Suspense, ComponentType, LazyExoticComponent, ErrorInfo } from 'react';
import { useEngineContext } from '../../providers/engine';
import { createAthenaWrapper } from '../athena';
import { EngineErrorBoundary } from '../boundary';
import type { EngineName } from '../../../types';

/**
 * Engine implementation loaders
 */
export interface EngineLoaders<P> {
  titan: () => Promise<{ default: ComponentType<P> }>;
  hermes: () => Promise<{ default: ComponentType<P> }>;
  apollo: () => Promise<{ default: ComponentType<P> }>;
  athena?: () => Promise<{ default: ComponentType<P> }>;
}

/**
 * Options for engine component creation
 */
export interface CreateEngineComponentOptions {
  /** Custom fallback UI while loading */
  fallback?: React.ReactNode;
  /** Whether to use Athena wrapper for pluggable components */
  athenaEnabled?: boolean;
  /** Fallback engine to use if primary fails to load */
  fallbackEngine?: EngineName;
  /** Callback when engine loading fails */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Creates an engine-aware component that dynamically loads the appropriate implementation
 *
 * @param displayName - Component name for debugging
 * @param loaders - Dynamic import functions for each engine
 * @param options - Optional configuration
 * @returns Engine-aware component
 *
 * @example
 * ```tsx
 * export const Button = createEngineComponent<ButtonProps>('Button', {
 *   titan: () => import('./titan'),
 *   hermes: () => import('./hermes'),
 *   apollo: () => import('./apollo'),
 * });
 * ```
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
