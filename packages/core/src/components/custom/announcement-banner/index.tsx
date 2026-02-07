import type { AnnouncementBannerProps } from './core';
import { ANNOUNCEMENT_BANNER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { AnnouncementBannerProps, AnnouncementBannerPreset } from './core';
export { ANNOUNCEMENT_BANNER_DEFAULTS } from './core';

export function AnnouncementBanner(props: AnnouncementBannerProps): React.ReactElement | null {
  const preset = props.preset ?? ANNOUNCEMENT_BANNER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

AnnouncementBanner.displayName = 'AnnouncementBanner';
