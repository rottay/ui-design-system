/**
 * Theme Presets
 */

import type { ThemeConfig } from '../../../types';
import { bithireTheme } from './bithire';
import { corporateTheme } from './corporate';
import { minimalTheme } from './minimal';

export { bithireTheme } from './bithire';
export { corporateTheme } from './corporate';
export { minimalTheme } from './minimal';

export const themePresets: Record<string, ThemeConfig> = {
  bithire: bithireTheme,
  corporate: corporateTheme,
  minimal: minimalTheme,
};

/**
 * Get a theme preset by name
 */
export function getThemePreset(name: string): ThemeConfig | undefined {
  return themePresets[name];
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themePresets);
}
