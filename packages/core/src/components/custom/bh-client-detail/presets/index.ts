/**
 * BhClientDetail - All Presets
 */

export { DashboardBhClientDetail } from './dashboard';
export { CompactBhClientDetail } from './compact';

import type { BhClientDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhClientDetailProps } from '../core';
import { DashboardBhClientDetail } from './dashboard';
import { CompactBhClientDetail } from './compact';

export const BH_CLIENT_DETAIL_PRESETS: Record<BhClientDetailPreset, ComponentType<BhClientDetailProps>> = {
  dashboard: DashboardBhClientDetail,
  compact: CompactBhClientDetail,
};
