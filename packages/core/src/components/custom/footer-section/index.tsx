/**
 * FooterSection - Main Export
 */

import type { FooterSectionProps } from './core';
import { FOOTER_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { FooterSectionProps, FooterSectionPreset, FooterColumn, SocialLink } from './core';
export { FOOTER_SECTION_DEFAULTS } from './core';

export function FooterSection(props: FooterSectionProps): React.ReactElement {
  const preset = props.preset ?? FOOTER_SECTION_DEFAULTS.preset ?? 'multi-column';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

FooterSection.displayName = 'FooterSection';
