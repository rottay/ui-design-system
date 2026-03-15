import type { BannerAlertProps } from './core';
import { BANNER_ALERT_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { BannerAlertProps, BannerAlertPreset, BannerAlertType, BannerAlertAction } from './core';
export { BANNER_ALERT_DEFAULTS } from './core';

export function BannerAlert(props: BannerAlertProps) {
  const mergedProps = { ...BANNER_ALERT_DEFAULTS, ...props };
  const preset = mergedProps.preset || 'standard';
  const PresetComponent = PRESETS[preset];

  return <PresetComponent {...mergedProps} />;
}
