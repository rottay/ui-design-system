'use client';

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import type { Engine } from '../types/engine';
import { useEngineContext } from '../providers/EngineProvider';

/**
 * Engine implementations map.
 * Each engine can have either a direct component or a lazy-loaded component.
 */
export interface EngineImplementations<P> {
  /** Titan engine (Ant Design) - Default */
  titan: ComponentType<P> | LazyExoticComponent<ComponentType<P>>;
  /** Hermes engine (DaisyUI) */
  hermes?: ComponentType<P> | LazyExoticComponent<ComponentType<P>> | null;
  /** Apollo engine (Native HTML + Tailwind) */
  apollo?: ComponentType<P> | LazyExoticComponent<ComponentType<P>> | null;
  /** Athena engine (Custom/Pluggable) */
  athena?: ComponentType<P> | LazyExoticComponent<ComponentType<P>> | null;
}

interface CreateEngineComponentOptions {
  /** Component display name for debugging */
  displayName?: string;
  /** Fallback UI while lazy loading */
  fallback?: React.ReactNode;
}

/**
 * Creates a multi-engine component that automatically switches implementations
 * based on the current engine context.
 *
 * @example
 * ```tsx
 * const Button = createEngineComponent({
 *   titan: AntButton,
 *   hermes: lazy(() => import('../daisyui/Button')),
 *   apollo: lazy(() => import('../apollo/Button')),
 * }, { displayName: 'Button' });
 * ```
 */
export function createEngineComponent<P extends object>(
  implementations: EngineImplementations<P>,
  options: CreateEngineComponentOptions = {}
): ComponentType<P> {
  const { displayName = 'EngineComponent', fallback = null } = options;

  function EngineRoutedComponent(props: P) {
    const { engine } = useEngineContext();

    // Get implementation for current engine, fallback to titan
    const Implementation = getImplementation(implementations, engine);

    if (!Implementation) {
      console.warn(
        `[${displayName}] No implementation found for engine "${engine}", falling back to titan`
      );
      const TitanFallback = implementations.titan;
      return <TitanFallback {...(props as any)} />;
    }

    // Check if it's a lazy component (has $$typeof for lazy)
    const isLazy = (Implementation as any)?.$$typeof === Symbol.for('react.lazy');

    if (isLazy) {
      return (
        <Suspense fallback={fallback}>
          <Implementation {...(props as any)} />
        </Suspense>
      );
    }

    return <Implementation {...(props as any)} />;
  }

  EngineRoutedComponent.displayName = displayName;

  return EngineRoutedComponent;
}

/**
 * Gets the implementation for the specified engine with fallback chain.
 */
function getImplementation<P>(
  implementations: EngineImplementations<P>,
  engine: Engine
): ComponentType<P> | LazyExoticComponent<ComponentType<P>> | null {
  const impl = implementations[engine];

  // If implementation exists and is not null, use it
  if (impl) {
    return impl;
  }

  // Fallback chain: athena -> apollo -> hermes -> titan
  if (engine === 'athena') {
    return implementations.apollo ?? implementations.hermes ?? implementations.titan;
  }
  if (engine === 'apollo') {
    return implementations.hermes ?? implementations.titan;
  }
  if (engine === 'hermes') {
    return implementations.titan;
  }

  // Default to titan
  return implementations.titan;
}

/**
 * Helper to create lazy imports for engine implementations.
 * Wraps React.lazy with proper typing.
 */
export function lazyEngine<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): LazyExoticComponent<ComponentType<P>> {
  return lazy(importFn);
}
