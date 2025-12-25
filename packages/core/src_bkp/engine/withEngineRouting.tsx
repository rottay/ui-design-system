'use client';

import { forwardRef, type ComponentType, type ForwardRefExoticComponent } from 'react';
import type { Engine } from '../types/engine';
import { useEngineContext } from '../providers/EngineProvider';

type EngineMap<P> = Partial<Record<Engine, ComponentType<P> | null>> & {
  titan: ComponentType<P>;
};

interface WithEngineRoutingOptions {
  displayName?: string;
}

/**
 * HOC that wraps a component with engine routing.
 * Simpler alternative to createEngineComponent for basic use cases.
 *
 * @example
 * ```tsx
 * const Button = withEngineRouting(
 *   {
 *     titan: AntButton,
 *     hermes: DaisyButton,
 *     apollo: ApolloButton,
 *   },
 *   { displayName: 'Button' }
 * );
 * ```
 */
export function withEngineRouting<P extends object>(
  engines: EngineMap<P>,
  options: WithEngineRoutingOptions = {}
): ComponentType<P> {
  const { displayName = 'EngineRoutedComponent' } = options;

  function EngineRoutedComponent(props: P) {
    const { engine } = useEngineContext();

    // Get component for current engine with fallback to titan
    const Component = engines[engine] ?? engines.titan;

    return <Component {...props} />;
  }

  EngineRoutedComponent.displayName = displayName;

  return EngineRoutedComponent;
}

/**
 * HOC that wraps a forwardRef component with engine routing.
 * Use when components need to forward refs.
 */
export function withEngineRoutingRef<P extends object, R = unknown>(
  engines: EngineMap<P>,
  options: WithEngineRoutingOptions = {}
): ForwardRefExoticComponent<P & { ref?: React.Ref<R> }> {
  const { displayName = 'EngineRoutedComponent' } = options;

  const EngineRoutedComponent = forwardRef<R, P>((props, ref) => {
    const { engine } = useEngineContext();
    const Component = engines[engine] ?? engines.titan;

    return <Component {...(props as any)} ref={ref} />;
  });

  EngineRoutedComponent.displayName = displayName;

  return EngineRoutedComponent as ForwardRefExoticComponent<P & { ref?: React.Ref<R> }>;
}
