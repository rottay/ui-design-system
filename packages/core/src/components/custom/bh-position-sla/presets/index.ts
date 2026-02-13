/**
 * BhPositionSla - All Presets
 */

import type { BhPositionSlaPreset } from '../core';
import { MonitorBhPositionSla } from './monitor';
import { CompactBhPositionSla } from './compact';

export { MonitorBhPositionSla } from './monitor';
export { CompactBhPositionSla } from './compact';

export const BH_POSITION_SLA_PRESETS: Record<BhPositionSlaPreset, React.ComponentType<any>> = {
  monitor: MonitorBhPositionSla,
  compact: CompactBhPositionSla,
};
