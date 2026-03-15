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

import {
  lazy,
  Suspense,
  ComponentType,
  LazyExoticComponent,
  ErrorInfo,
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import { useEngineContext } from './EngineProvider';
import { createAthenaWrapper } from './athena';
import { EngineErrorBoundary } from './boundary';
import type { EngineName } from '../contracts';

/**
 * Configuration object containing dynamic import functions for each engine.
 */
export interface EngineLoaders<P> {
  /** Loader for Classic engine (Ant Design) */
  classic: () => Promise<{ default: ComponentType<P> | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> }>;
  /** Loader for Modern engine (DaisyUI/Tailwind) */
  modern: () => Promise<{ default: ComponentType<P> | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> }>;
  /** Loader for Rustic engine (Vanilla HTML/CSS) */
  rustic: () => Promise<{ default: ComponentType<P> | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> }>;
  /** Optional loader for Athena engine (custom implementations) */
  athena?: () => Promise<{ default: ComponentType<P> | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> }>;
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
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> {
  const { fallback = null, athenaEnabled = true, fallbackEngine, onError } = options;

  // Create Athena wrapper that checks for registered components
  const athenaLoader = athenaEnabled
    ? createAthenaWrapper<P>(displayName, loaders.athena || loaders.rustic)
    : (loaders.athena || loaders.rustic);

  // Create lazy components for each engine
  const components: Record<EngineName, LazyExoticComponent<ComponentType<any>>> = {
    classic: lazy(loaders.classic as () => Promise<{ default: ComponentType<any> }>),
    modern: lazy(loaders.modern as () => Promise<{ default: ComponentType<any> }>),
    rustic: lazy(loaders.rustic as () => Promise<{ default: ComponentType<any> }>),
    athena: lazy(athenaLoader as () => Promise<{ default: ComponentType<any> }>),
  };

  // Create the router component
  const EngineRouter = forwardRef<any, P & { engine?: EngineName }>((props, ref) => {
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
          <Component {...(componentProps as any)} ref={ref} />
        </Suspense>
      </EngineErrorBoundary>
    );
  });

  EngineRouter.displayName = displayName;

  return EngineRouter;
}
