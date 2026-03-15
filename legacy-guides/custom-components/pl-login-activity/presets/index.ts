/**
 * PlLoginActivity - All Presets
 */

export { TimelinePlLoginActivity } from './timeline';
export { MapPlLoginActivity } from './map';

import type { PlLoginActivityPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlLoginActivityProps } from '../core';
import { TimelinePlLoginActivity } from './timeline';
import { MapPlLoginActivity } from './map';

export const PL_LOGIN_ACTIVITY_PRESETS: Record<PlLoginActivityPreset, ComponentType<PlLoginActivityProps>> = {
  timeline: TimelinePlLoginActivity,
  map: MapPlLoginActivity,
};
