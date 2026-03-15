import type { AnnouncementBannerPreset, AnnouncementBannerProps } from '../core';
import { StandardPreset } from './standard';
import { GradientPreset } from './gradient';

export const PRESETS: Record<
  AnnouncementBannerPreset,
  React.ComponentType<AnnouncementBannerProps>
> = {
  standard: StandardPreset,
  gradient: GradientPreset,
};
