'use client';

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
 *   classic: () => import('./engines/classic'),
 *   modern: () => import('./engines/modern'),
 *   rustic: () => import('./engines/rustic'),
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
 */
export interface EngineLoaders<P> {
  /** Loader for Classic engine (Ant Design) */
  classic: () => Promise<{ default: ComponentType<P> }>;
  /** Loader for Modern engine (DaisyUI/Tailwind) */
  modern: () => Promise<{ default: ComponentType<P> }>;
  /** Loader for Rustic engine (Vanilla HTML/CSS) */
  rustic: () => Promise<{ default: ComponentType<P> }>;
  /** Optional loader for Athena engine (custom implementations) */
  athena?: () => Promise<{ default: ComponentType<P> }>;
}

/**
 * Optional configuration for customizing engine component behavior.
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
 */
export function createEngineComponent<P extends object>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options: CreateEngineComponentOptions = {}
): ComponentType<P> {
  const { fallback = null, athenaEnabled = true, fallbackEngine, onError } = options;

  // Create Athena wrapper that checks for registered components
  const athenaLoader = athenaEnabled
    ? createAthenaWrapper<P>(displayName, loaders.athena || loaders.rustic)
    : (loaders.athena || loaders.rustic);

  // Create lazy components for each engine
  const components: Record<EngineName, LazyExoticComponent<ComponentType<P>>> = {
    classic: lazy(loaders.classic),
    modern: lazy(loaders.modern),
    rustic: lazy(loaders.rustic),
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
