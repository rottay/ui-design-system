/**
 * Theme Presets
 */

import type { ThemeConfig } from '../../../core/types';
import { bithireTheme } from './bithire';
import { corporateTheme } from './corporate';
import { evntoTheme } from './evnto';
import { minimalTheme } from './minimal';

export { bithireTheme } from './bithire';
export { corporateTheme } from './corporate';
export { evntoTheme } from './evnto';
export { minimalTheme } from './minimal';

export const themePresets: Record<string, ThemeConfig> = {
  bithire: bithireTheme,
  corporate: corporateTheme,
  evnto: evntoTheme,
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
