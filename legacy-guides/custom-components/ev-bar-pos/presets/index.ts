/**
 * EvBarPos - All Presets
 */

export { CashierEvBarPos } from './cashier';
export { SelfServiceEvBarPos } from './self-service';

import type { EvBarPosPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvBarPosProps } from '../core';
import { CashierEvBarPos } from './cashier';
import { SelfServiceEvBarPos } from './self-service';

export const EV_BAR_POS_PRESETS: Record<EvBarPosPreset, ComponentType<EvBarPosProps>> = {
  cashier: CashierEvBarPos,
  'self-service': SelfServiceEvBarPos,
};
