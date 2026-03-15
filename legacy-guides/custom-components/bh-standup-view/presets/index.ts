/**
 * BhStandupView - All Presets
 */

export { DailyBhStandupView } from './daily';

import type { BhStandupViewPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhStandupViewProps } from '../core';
import { DailyBhStandupView } from './daily';

export const BH_STANDUP_VIEW_PRESETS: Record<BhStandupViewPreset, ComponentType<BhStandupViewProps>> = {
  daily: DailyBhStandupView,
};
