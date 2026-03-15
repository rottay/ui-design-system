/**
 * BhTemplateLibrary - Main Export
 * Template Browse & Select screen for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTemplateLibraryProps } from './core';
import { BH_TEMPLATE_LIBRARY_DEFAULTS } from './core';
import { BH_TEMPLATE_LIBRARY_PRESETS } from './presets';

export {
  type BhTemplateLibraryProps,
  type BhTemplateLibraryPreset,
  type TemplateItem,
  type TemplateStage,
  type TemplateFilter,
  type IndustryGroup,
  BH_TEMPLATE_LIBRARY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTemplateLibrary component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTemplateLibrary(props: BhTemplateLibraryProps): React.ReactElement {
  const preset = props.preset ?? BH_TEMPLATE_LIBRARY_DEFAULTS.preset ?? 'cards';
  const PresetComponent = BH_TEMPLATE_LIBRARY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTemplateLibrary.displayName = 'BhTemplateLibrary';

export { CardsBhTemplateLibrary, TableBhTemplateLibrary } from './presets';
