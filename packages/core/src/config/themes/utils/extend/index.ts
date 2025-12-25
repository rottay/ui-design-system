/**
 * Theme Extend Utility
 * Extends a base theme with overrides
 */

import type { ThemeConfig } from '../../../../types';
import { foundationTheme } from '../../foundation';
import { getThemePreset } from '../../presets';

/**
 * Extend a theme with additional variables
 */
export function extendTheme(
  base: ThemeConfig | string,
  overrides: Partial<ThemeConfig>
): ThemeConfig {
  // Resolve base theme if string
  const baseTheme = typeof base === 'string'
    ? (getThemePreset(base) ?? foundationTheme)
    : base;

  return {
    name: overrides.name ?? `${baseTheme.name}-extended`,
    extends: baseTheme.name,
    variables: {
      ...baseTheme.variables,
      ...overrides.variables,
    },
    engineOverrides: mergeEngineOverrides(
      baseTheme.engineOverrides,
      overrides.engineOverrides
    ),
  };
}

/**
 * Merge engine overrides deeply
 */
function mergeEngineOverrides(
  base?: ThemeConfig['engineOverrides'],
  overrides?: ThemeConfig['engineOverrides']
): ThemeConfig['engineOverrides'] {
  if (!base && !overrides) return undefined;
  if (!base) return overrides;
  if (!overrides) return base;

  const result: ThemeConfig['engineOverrides'] = { ...base };

  for (const [engine, config] of Object.entries(overrides)) {
    result[engine as keyof typeof result] = {
      ...base[engine as keyof typeof base],
      ...config,
    };
  }

  return result;
}
