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
 * - **Error handling**: Built-in error boundary
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
 * @example Declaring an absence
 * ```tsx
 * export const WorkbenchHeader = createEngineComponent<Props>('WorkbenchHeader', {
 *   classic: () => import('./engines/classic'),
 *   modern: () => import('./engines/modern'),
 *   rustic: null,
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
import { useDeclaredEngine } from '../../composition/react/provider';
import { createCustomWrapper } from '../../runtime/customization/component-registry';
import { EngineErrorBoundary } from './error-boundary';
import type { EngineName } from '../../../../../foundation/contracts';
import { TenantContext } from '../../../tenant/foundation/context';

/** The engines a component ships a physical implementation for. */
export type ImplementedEngineName = Exclude<EngineName, 'custom'>;

export type EngineImplementationLoader<P> = () => Promise<{
  default: ComponentType<P> | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<any>>;
}>;

/**
 * One loader per implemented engine, TOTAL over the roster.
 *
 * `null` is a DECLARED absence, not a hole: a component with no rustic
 * implementation says so and selecting rustic throws, instead of forwarding to
 * another engine's directory and painting a different product's chrome under
 * the user's chosen engine name.
 *
 * `custom` is deliberately not a key. A custom component is resolved from a
 * registered component pack, never from a bundled module, so a per-component
 * custom loader could only ever be a second answer to the same question.
 */
export type EngineLoaders<P> = Readonly<
  Record<ImplementedEngineName, EngineImplementationLoader<P> | null>
>;

/**
 * Optional configuration for customizing engine component behavior.
 */
export interface CreateEngineComponentOptions {
  /** Custom fallback UI displayed while the component is lazy loading */
  fallback?: React.ReactNode;
  /** Whether the custom engine may resolve a registered pack (default: true) */
  customEnabled?: boolean;
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
 *
 * The factory uses `any` for component props and ref types because the
 * generic P is erased at the lazy() boundary. This is a known TypeScript
 * limitation with lazy + forwardRef + generic components.
 */
export function createEngineComponent<P extends object>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options: CreateEngineComponentOptions = {}
): ForwardRefExoticComponent<
  PropsWithoutRef<P> & { engine?: EngineName } & RefAttributes<any>
> {
  const { fallback = null, customEnabled = true, onError } = options;

  /** A declared absence resolves to a named refusal, never to another engine. */
  const implementation = (
    engine: ImplementedEngineName
  ): (() => Promise<{ default: ComponentType<any> }>) => {
    const loader = loaders[engine];
    if (loader) return loader as () => Promise<{ default: ComponentType<any> }>;
    return () => {
      throw new Error(
        `${displayName} has no ${engine} implementation. ` +
          'The loader declares that absence; there is no fallback engine.'
      );
    };
  };

  const components: Record<EngineName, LazyExoticComponent<ComponentType<any>>> = {
    classic: lazy(implementation('classic')),
    modern: lazy(implementation('modern')),
    rustic: lazy(implementation('rustic')),
    custom: lazy(createCustomWrapper<P>(displayName, undefined, customEnabled) as () => Promise<{ default: ComponentType<any> }>),
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
      const packLoader = createCustomWrapper<P>(displayName, pack, customEnabled);
      cached = lazy(packLoader as () => Promise<{ default: ComponentType<any> }>);
      packLazyCache.set(pack, cached);
    }
    return cached;
  }

  // Create the router component
  const EngineRouter = forwardRef<any, P & { engine?: EngineName }>((props, ref) => {
    const declaredEngine = useDeclaredEngine();

    // Read tenant context if available. Components can still render without a
    // TenantProvider, but in that case custom pack resolution falls back to the
    // default custom registry.
    const tenantCtx = useContext(TenantContext);
    const componentPack = tenantCtx?.config?.componentPack;

    // A per-instance `engine` prop outranks the provider; with neither, nothing
    // has declared what should render and the refusal below names that.
    const activeEngine = props.engine ?? declaredEngine;

    // `componentPack` selects WHICH components render; it never paints. This
    // factory therefore holds nothing on the document — no `<style>` element,
    // no custom properties on `documentElement`, no refcount to unwind. Tenant
    // visuals arrive as the server-compiled artifact the client hydrates under
    // `visualAuthority="compiled-artifact"`, and nothing here may compete with
    // it. Component resolution below is pure lookup.

    // Custom engine is the only path that needs tenant-aware component lookup.
    // Standard engines are fully determined by the active engine name.
    const Component = useMemo(() => {
      if (!activeEngine) {
        throw new Error(
          `${displayName}: no engine is declared. Pass an \`engine\` prop, or mount ` +
            'DesignSystemProvider or EngineProvider; there is no fallback engine.'
        );
      }
      if (activeEngine === 'custom' && customEnabled && componentPack) {
        return getPackLazyComponent(componentPack);
      }
      const resolved = components[activeEngine];
      if (!resolved) {
        throw new Error(
          `${displayName}: "${String(activeEngine)}" is not a known engine.`
        );
      }
      return resolved;
    }, [activeEngine, componentPack]);

    // Remove engine prop before passing to implementation
    const { engine: _, ...componentProps } = props;

    return (
      <EngineErrorBoundary onError={onError}>
        <Suspense fallback={fallback}>
          <Component {...(componentProps as any)} ref={ref} />
        </Suspense>
      </EngineErrorBoundary>
    );
  });

  EngineRouter.displayName = displayName;

  return EngineRouter;
}
