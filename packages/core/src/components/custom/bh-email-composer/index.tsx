/**
 * BhEmailComposer - Main Export
 * AI email drafting with templates and variables
 */

import type { BhEmailComposerProps } from './core';
import { BH_EMAIL_COMPOSER_DEFAULTS } from './core';
import { BH_EMAIL_COMPOSER_PRESETS } from './presets';

export {
  type BhEmailComposerProps,
  type BhEmailComposerPreset,
  type EmailTemplate,
  type EmailVariable,
  BH_EMAIL_COMPOSER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhEmailComposer component
 * Renders the appropriate preset based on the preset prop
 */
export function BhEmailComposer(props: BhEmailComposerProps): React.ReactElement {
  const preset = props.preset ?? BH_EMAIL_COMPOSER_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_EMAIL_COMPOSER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhEmailComposer.displayName = 'BhEmailComposer';
