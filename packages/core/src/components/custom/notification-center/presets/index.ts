import panel from './panel';
import dropdown from './dropdown';
import fullPage from './full-page';

export { panel, dropdown, fullPage };

export const PRESETS = {
  panel,
  dropdown,
  'full-page': fullPage,
} as const;
