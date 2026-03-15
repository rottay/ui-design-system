import type { ConsentBannerProps } from './core';
import { CONSENT_BANNER_DEFAULTS } from './core';
import { CONSENT_BANNER_PRESETS } from './presets';

export {
  type ConsentBannerProps,
  type ConsentBannerPreset,
  type ConsentCategory,
  CONSENT_BANNER_DEFAULTS,
  DEFAULT_CATEGORIES,
} from './core';
export * from './presets';

export function ConsentBanner(props: ConsentBannerProps): React.ReactElement {
  const preset = props.preset ?? CONSENT_BANNER_DEFAULTS.preset ?? 'bar';
  const PresetComponent = CONSENT_BANNER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

ConsentBanner.displayName = 'ConsentBanner';
