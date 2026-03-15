/**
 * EvTimeClock - All Presets
 */

export { StandardEvTimeClock } from './standard';
export { KioskEvTimeClock } from './kiosk';

import type { EvTimeClockPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTimeClockProps } from '../core';
import { StandardEvTimeClock } from './standard';
import { KioskEvTimeClock } from './kiosk';

export const EV_TIME_CLOCK_PRESETS: Record<EvTimeClockPreset, ComponentType<EvTimeClockProps>> = {
  standard: StandardEvTimeClock,
  kiosk: KioskEvTimeClock,
};
