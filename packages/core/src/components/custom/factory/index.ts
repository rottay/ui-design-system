'use client';

/**
 * Custom Component Factory
 * Creates preset-based custom components
 */

import React, { ComponentType, useMemo } from 'react';
import type { EngineName, TenantConfig, DesignTokens } from '../../../types';
import { useTenant } from '../../../core/hooks/tenant';
import { useTokens } from '../../../core/hooks/tokens';

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
  /** Design tokens with tenant overrides */
  tokens: DesignTokens;
  /** Current tenant configuration */
  tenant: TenantConfig;
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
  render: (context: PresetContext<P>) => React.ReactElement;
}

/**
 * Create a custom component from a preset config
 */
export function createPreset<P extends object>(
  config: PresetConfig<P>
): ComponentType<P> {
  const PresetComponent: React.FC<P> = (props) => {
    const { config: tenant } = useTenant();
    const tokens = useTokens();

    const context = useMemo<PresetContext<P>>(() => ({
      primitives: Primitives,
      props,
      tokens,
      tenant,
    }), [props, tokens, tenant]);

    return config.render(context);
  };

  PresetComponent.displayName = `Preset(${config.name})`;

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
