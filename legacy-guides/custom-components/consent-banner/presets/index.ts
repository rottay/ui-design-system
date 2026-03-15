export { BarConsentBanner } from './bar';
export { ModalConsentBanner } from './modal';

import type { ConsentBannerPreset } from '../core';
import type { ComponentType } from 'react';
import type { ConsentBannerProps } from '../core';
import { BarConsentBanner } from './bar';
import { ModalConsentBanner } from './modal';

export const CONSENT_BANNER_PRESETS: Record<ConsentBannerPreset, ComponentType<ConsentBannerProps>> = {
  bar: BarConsentBanner,
  modal: ModalConsentBanner,
};
