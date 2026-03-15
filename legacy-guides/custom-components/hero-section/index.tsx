/**
 * HeroSection - Main Export
 */

import type { HeroSectionProps } from './core';
import { HERO_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { HeroSectionProps, HeroSectionPreset, HeroSectionAction } from './core';
export { HERO_SECTION_DEFAULTS } from './core';

export function HeroSection(props: HeroSectionProps): React.ReactElement {
  const preset = props.preset ?? HERO_SECTION_DEFAULTS.preset ?? 'centered';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

HeroSection.displayName = 'HeroSection';
