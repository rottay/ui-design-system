/**
 * BhPositionSla - All Presets
 */

import type { BhPositionSlaPreset, BhPositionSlaProps } from '../core';
import type { ComponentType } from 'react';
import { MonitorBhPositionSla } from './monitor';
import { CompactBhPositionSla } from './compact';

export { MonitorBhPositionSla } from './monitor';
export { CompactBhPositionSla } from './compact';

export const BH_POSITION_SLA_PRESETS: Record<BhPositionSlaPreset, ComponentType<BhPositionSlaProps>> = {
  monitor: MonitorBhPositionSla,
  compact: CompactBhPositionSla,
};
