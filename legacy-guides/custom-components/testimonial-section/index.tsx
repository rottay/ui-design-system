/**
 * TestimonialSection - Main Export
 */

import type { TestimonialSectionProps } from './core';
import { TESTIMONIAL_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { TestimonialSectionProps, TestimonialSectionPreset, Testimonial } from './core';
export { TESTIMONIAL_SECTION_DEFAULTS } from './core';

export function TestimonialSection(props: TestimonialSectionProps): React.ReactElement {
  const preset = props.preset ?? TESTIMONIAL_SECTION_DEFAULTS.preset ?? 'cards';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

TestimonialSection.displayName = 'TestimonialSection';
