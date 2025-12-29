/**
 * Theme Merge Utility
 * Deep merge theme configurations
 */

import type { ThemeConfig } from '../../../../core/types';

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key as keyof typeof source];
    const targetValue = target[key as keyof typeof target];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Merge multiple theme configs
 */
export function mergeThemes(...themes: Partial<ThemeConfig>[]): ThemeConfig {
  const baseConfig: ThemeConfig = {
    name: 'merged',
    variables: {},
  };

  const result = themes.reduce((merged, theme) => {
    return deepMerge(merged, theme);
  }, baseConfig);

  // Ensure required fields are always defined
  return {
    name: result.name || 'merged',
    variables: result.variables || {},
    extends: result.extends,
    engineOverrides: result.engineOverrides,
  };
}
