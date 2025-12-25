/**
 * Theme System Exports
 */

// Foundation
export { foundationTheme, getFoundationVariable } from './foundation';

// Presets
export {
  bithireTheme,
  corporateTheme,
  minimalTheme,
  themePresets,
  getThemePreset,
  getAvailableThemes,
} from './presets';

// Utils
export { extendTheme } from './utils/extend';
export { mergeThemes } from './utils/merge';

// CSS variables path for importing
export const FOUNDATION_CSS_PATH = './themes/foundation/variables/index.css';
