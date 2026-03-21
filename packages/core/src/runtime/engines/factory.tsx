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
 * - **Custom engine support**: Custom component registration
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
  useContext,
  useMemo,
  ComponentType,
  LazyExoticComponent,
  ErrorInfo,
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import { useEngineContext } from './EngineProvider';
import { createCustomWrapper } from './custom';
import { EngineErrorBoundary } from './boundary';
import type { EngineName } from '../../contracts';
import { TenantContext } from '../tenancy/TenantProvider';

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
  /** Optional loader for Custom engine (custom implementations) */
  custom?: () => Promise<{ default: ComponentType<P> | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> }>;
}

/**
 * Optional configuration for customizing engine component behavior.
 */
export interface CreateEngineComponentOptions {
  /** Custom fallback UI displayed while the component is lazy loading */
  fallback?: React.ReactNode;
  /** Whether to wrap with custom engine for custom component support (default: true) */
  customEnabled?: boolean;
  /** Fallback engine to use if the primary engine fails to load */
  fallbackEngine?: EngineName;
  /** Callback invoked when engine loading encounters an error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Creates an engine-aware component that dynamically loads the appropriate
 * implementation based on the current engine context or component-level override.
 *
 * When the active engine is `custom`, the factory reads the current tenant's
 * `componentPack` from TenantProvider context and resolves components from
 * the pack-scoped registry. This enables different tenants to use different
 * component packs in the same runtime without cross-contamination.
 */
export function createEngineComponent<P extends object>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options: CreateEngineComponentOptions = {}
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>> {
  const { fallback = null, customEnabled = true, fallbackEngine, onError } = options;

  // Default custom loader (no pack) for backward compatibility
  const defaultCustomLoader = customEnabled
    ? createCustomWrapper<P>(displayName, loaders.custom || loaders.rustic)
    : (loaders.custom || loaders.rustic);

  // Create lazy components for the three standard engines
  const components: Record<EngineName, LazyExoticComponent<ComponentType<any>>> = {
    classic: lazy(loaders.classic as () => Promise<{ default: ComponentType<any> }>),
    modern: lazy(loaders.modern as () => Promise<{ default: ComponentType<any> }>),
    rustic: lazy(loaders.rustic as () => Promise<{ default: ComponentType<any> }>),
    custom: lazy(defaultCustomLoader as () => Promise<{ default: ComponentType<any> }>),
  };

  // Cache of pack-scoped lazy components to avoid re-creating on every render
  const packLazyCache = new Map<string, LazyExoticComponent<ComponentType<any>>>();

  /**
   * Returns a lazy component for a given pack. Cached so the same pack
   * always returns the same React.lazy instance (required for Suspense stability).
   */
  function getPackLazyComponent(pack: string): LazyExoticComponent<ComponentType<any>> {
    let cached = packLazyCache.get(pack);
    if (!cached) {
      const packLoader = createCustomWrapper<P>(
        displayName,
        loaders.custom || loaders.rustic,
        pack
      );
      cached = lazy(packLoader as () => Promise<{ default: ComponentType<any> }>);
      packLazyCache.set(pack, cached);
    }
    return cached;
  }

  // Create the router component
  const EngineRouter = forwardRef<any, P & { engine?: EngineName }>((props, ref) => {
    const context = useEngineContext();

    // Read tenant context if available. Components can still render without a
    // TenantProvider, but in that case custom pack resolution falls back to the
    // default custom registry.
    const tenantCtx = useContext(TenantContext);
    const componentPack = tenantCtx?.config?.componentPack;

    // Allow engine prop to override context engine
    const activeEngine = props.engine || context.engine;

    // Custom engine is the only path that needs tenant-aware component lookup.
    // Standard engines are fully determined by the active engine name.
    const Component = useMemo(() => {
      if (activeEngine === 'custom' && customEnabled && componentPack) {
        return getPackLazyComponent(componentPack);
      }
      return components[activeEngine];
    }, [activeEngine, componentPack]);

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
