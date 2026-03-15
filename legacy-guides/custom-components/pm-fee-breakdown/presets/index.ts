/**
 * PmFeeBreakdown - All Presets
 */

export { PanelPmFeeBreakdown } from './panel';
export { InlinePmFeeBreakdown } from './inline';

import type { PmFeeBreakdownPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmFeeBreakdownProps } from '../core';
import { PanelPmFeeBreakdown } from './panel';
import { InlinePmFeeBreakdown } from './inline';

export const PM_FEE_BREAKDOWN_PRESETS: Record<PmFeeBreakdownPreset, ComponentType<PmFeeBreakdownProps>> = {
  panel: PanelPmFeeBreakdown,
  inline: InlinePmFeeBreakdown,
};
