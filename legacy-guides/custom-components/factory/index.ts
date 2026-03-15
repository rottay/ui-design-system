'use client';

/**
 * Custom Component Factory
 * Creates preset-based custom components with engine-aware context
 */

import React, { ComponentType, useMemo } from 'react';
import type { EngineName, TenantConfig, DesignTokens, ComponentExtensions, ExtensionHelpers } from '../../../types';
import { useTenant } from '../../../core/hooks/tenant';
import { useTokens } from '../../../core/hooks/tokens';
import { useEngineContext } from '../../../core/providers/engine';
import { createExtensionHelpers } from './extensions';

// Re-export primitives for use in presets
import * as Primitives from '../../primitives';

/**
 * Context provided to preset render functions
 */
export interface PresetContext<P = unknown> {
  /** All primitive components, pre-bound to engine */
  primitives: typeof Primitives;
  /** Props passed to the component */
  props: P;
  /** Design tokens with tenant overrides and engine differentiation */
  tokens: DesignTokens;
  /** Current tenant configuration */
  tenant: TenantConfig;
  /** Active engine name (set by the app, not by the design system) */
  engine: EngineName;
  /** Extension helpers - always available, no-op when no extensions */
  ext: ExtensionHelpers;
}

/**
 * Configuration for a custom component preset
 */
export interface PresetConfig<P = unknown> {
  /** Name of the preset */
  name: string;
  /** Force a specific engine for all primitives */
  engine?: EngineName;
  /** Per-primitive engine overrides */
  engineOverrides?: Partial<Record<string, EngineName>>;
  /** The render function */
  render: (context: PresetContext<P>) => React.ReactElement | null;
}

/**
 * Create a custom component from a preset config object or a render function.
 * Accepts either:
 * - `PresetConfig<P>` (object with name + render)
 * - A bare render function `(context: PresetContext<P>) => React.ReactElement`
 * - A name string + render function pair `(name, renderFn)`
 */
export function createPreset<P extends object>(
  name: string,
  renderFn: (context: PresetContext<P>) => React.ReactElement | null
): ComponentType<P>;
export function createPreset<P extends object>(
  config: PresetConfig<P> | ((context: PresetContext<P>) => React.ReactElement | null)
): ComponentType<P>;
export function createPreset<P extends object>(
  configOrName: string | PresetConfig<P> | ((context: PresetContext<P>) => React.ReactElement | null),
  renderFn?: (context: PresetContext<P>) => React.ReactElement | null
): ComponentType<P> {
  let resolved: PresetConfig<P>;
  if (typeof configOrName === 'string') {
    // Called as createPreset('name', renderFn)
    resolved = { name: configOrName, render: renderFn! };
  } else if (typeof configOrName === 'function') {
    resolved = { name: 'Anonymous', render: configOrName };
  } else {
    resolved = configOrName;
  }

  const PresetComponent: React.FC<P> = (props) => {
    const { config: tenant } = useTenant();
    const tokens = useTokens();
    const { engine } = useEngineContext();

    // Extract extensions from props (available on all EngineAwareProps)
    const extensions = (props as Record<string, unknown>).extensions as ComponentExtensions | undefined;

    const ext = useMemo(
      () => createExtensionHelpers(extensions, tokens),
      [extensions, tokens],
    );

    // Sanitize null prop values to undefined so destructuring defaults work.
    // e.g. `const { items = [] } = props` catches undefined but NOT null.
    // useServerAction initially returns data: null, which pages may pass through.
    //
    // NOTE: This conversion is safe for presets that just destructure-and-render.
    // Presets that sync props to state via useEffect MUST use stable constants
    // instead of destructuring defaults (see bh-interview-monitor for example).
    const safeProps = useMemo(() => {
      const result = {} as Record<string, unknown>;
      for (const key in props) {
        const val = (props as Record<string, unknown>)[key];
        result[key] = val === null ? undefined : val;
      }
      return result as P;
    }, [props]);

    const context = useMemo<PresetContext<P>>(() => ({
      primitives: Primitives,
      props: safeProps,
      tokens,
      tenant,
      engine,
      ext,
    }), [safeProps, tokens, tenant, engine, ext]);

    return resolved.render(context);
  };

  PresetComponent.displayName = `Preset(${resolved.name})`;

  return PresetComponent;
}

/**
 * Helper to create multiple presets for a component
 */
export function createPresets<P extends object>(
  presets: Record<string, PresetConfig<P>>
): Record<string, ComponentType<P>> {
  const components: Record<string, ComponentType<P>> = {};

  for (const [key, config] of Object.entries(presets)) {
    components[key] = createPreset(config);
  }

  return components;
}
