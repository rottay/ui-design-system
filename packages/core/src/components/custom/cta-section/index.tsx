/**
 * CtaSection - Main Export
 */

import type { CtaSectionProps } from './core';
import { CTA_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { CtaSectionProps, CtaSectionPreset, CtaSectionAction } from './core';
export { CTA_SECTION_DEFAULTS } from './core';

export function CtaSection(props: CtaSectionProps): React.ReactElement {
  const preset = props.preset ?? CTA_SECTION_DEFAULTS.preset ?? 'banner';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

CtaSection.displayName = 'CtaSection';
