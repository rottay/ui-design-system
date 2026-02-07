/**
 * BhJobDetail - All Presets
 */

import type { BhJobDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhJobDetailProps } from '../core';
import { FullBhJobDetail } from './full';
import { CompactBhJobDetail } from './compact';

export { FullBhJobDetail } from './full';
export { CompactBhJobDetail } from './compact';

export const BH_JOB_DETAIL_PRESETS: Record<BhJobDetailPreset, ComponentType<BhJobDetailProps>> = {
  full: FullBhJobDetail,
  compact: CompactBhJobDetail,
};
