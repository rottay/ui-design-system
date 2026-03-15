/**
 * FaqSection - Main Export
 */

import type { FaqSectionProps } from './core';
import { FAQ_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { FaqSectionProps, FaqSectionPreset, FaqItem, FaqCategory } from './core';
export { FAQ_SECTION_DEFAULTS } from './core';

export function FaqSection(props: FaqSectionProps): React.ReactElement {
  const preset = props.preset ?? FAQ_SECTION_DEFAULTS.preset ?? 'accordion';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

FaqSection.displayName = 'FaqSection';
