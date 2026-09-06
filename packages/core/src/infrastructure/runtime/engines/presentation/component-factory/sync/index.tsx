'use client';

/**
 * @fileoverview Synchronous engine component factory - Rottay Design System
 * @description The non-suspending sibling of `createEngineComponent`, for
 * families that render inside every other component's tree and therefore cannot
 * sit behind a `Suspense` boundary. It answers the same three questions the lazy
 * factory answers -- which engine is active, is it implemented, and does a
 * registered pack own it -- and refuses by name when the answer is none.
 *
 * @module System/Engines/Factory
 * @category System
 * @package @rottay/design-system
 */

import {
  useContext,
  useMemo,
  ComponentType,
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import { useDeclaredEngine } from '../../../composition/react/provider';
import { getCustomComponent } from '../../../runtime/customization/component-registry';
import type { EngineName } from '../../../../../../foundation/contracts';
import {
  EXTENSION_ENGINE,
  type ImplementedEngineName,
} from '../../../../../../foundation/contracts/kernel/engine-identity';
import { TenantContext } from '../../../../tenant/foundation/context';

/** TOTAL over the implemented roster; `null` is a declared absence. */
export type SyncEngineImplementations<P> = Readonly<
  Record<ImplementedEngineName, ComponentType<P> | null>
>;

export interface CreateSyncEngineComponentOptions {
  /** Whether the custom engine may resolve a registered pack (default: true) */
  customEnabled?: boolean;
}

export function createSyncEngineComponent<P extends object>(
  displayName: string,
  implementations: SyncEngineImplementations<P>,
  options: CreateSyncEngineComponentOptions = {}
): ForwardRefExoticComponent<
  PropsWithoutRef<P> & { engine?: EngineName } & RefAttributes<any>
> {
  const { customEnabled = true } = options;

  const Resolved = forwardRef<any, P & { engine?: EngineName }>((props, ref) => {
    const declaredEngine = useDeclaredEngine();
    const tenantCtx = useContext(TenantContext);
    const componentPack = tenantCtx?.config?.componentPack;
    const activeEngine = props.engine ?? declaredEngine;

    const Component = useMemo((): ComponentType<any> => {
      if (!activeEngine) {
        throw new Error(
          `${displayName}: no engine is declared. Pass an \`engine\` prop, or mount ` +
            'DesignSystemProvider or EngineProvider; there is no fallback engine.'
        );
      }
      if (activeEngine === EXTENSION_ENGINE) {
        if (!customEnabled)
          throw new Error(
            `${displayName}: the custom engine is disabled for this component.`
          );
        const registered = getCustomComponent<P>(displayName, componentPack);
        if (registered) return registered as ComponentType<any>;
        throw new Error(
          `No custom implementation registered for "${displayName}"` +
            `${componentPack ? ` in pack "${componentPack}"` : ' in the default pack'}. ` +
            'Register one with registerCustomComponent; there is no fallback engine.'
        );
      }
      const implementation = implementations[activeEngine as ImplementedEngineName];
      if (implementation) return implementation as ComponentType<any>;
      throw new Error(
        `${displayName} has no ${String(activeEngine)} implementation. ` +
          'The implementation record declares that absence; there is no fallback engine.'
      );
    }, [activeEngine, componentPack]);

    const { engine: _engine, ...componentProps } = props;
    return <Component {...(componentProps as any)} ref={ref} />;
  });

  Resolved.displayName = displayName;
  return Resolved;
}
