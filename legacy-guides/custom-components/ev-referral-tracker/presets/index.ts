export { ReferralTrackerAmbassador } from './ambassador';
export { ReferralTrackerAdmin } from './admin';

import type { ReferralTrackerPreset } from '../core';
import type { ComponentType } from 'react';
import type { ReferralTrackerProps } from '../core';
import { ReferralTrackerAmbassador } from './ambassador';
import { ReferralTrackerAdmin } from './admin';

export const PRESETS: Record<
  ReferralTrackerPreset,
  ComponentType<ReferralTrackerProps>
> = {
  ambassador: ReferralTrackerAmbassador,
  admin: ReferralTrackerAdmin,
};
