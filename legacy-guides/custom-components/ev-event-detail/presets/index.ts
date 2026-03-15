/**
 * EvEventDetail - All Presets
 */

export { FullEvEventDetail } from './full';
export { CompactEvEventDetail } from './compact';

import type { EvEventDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvEventDetailProps } from '../core';
import { FullEvEventDetail } from './full';
import { CompactEvEventDetail } from './compact';

export const EV_EVENT_DETAIL_PRESETS: Record<EvEventDetailPreset, ComponentType<EvEventDetailProps>> = {
  full: FullEvEventDetail,
  compact: CompactEvEventDetail,
};
