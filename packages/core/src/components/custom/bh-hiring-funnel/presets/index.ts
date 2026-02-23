/**
 * BhHiringFunnel - All Presets
 */

import type { BhHiringFunnelPreset, BhHiringFunnelProps } from '../core';
import type { ComponentType } from 'react';
import { FunnelBhHiringFunnel } from './funnel';
import { CompactBhHiringFunnel } from './compact';

export { FunnelBhHiringFunnel } from './funnel';
export { CompactBhHiringFunnel } from './compact';

export const BH_HIRING_FUNNEL_PRESETS: Record<BhHiringFunnelPreset, ComponentType<BhHiringFunnelProps>> = {
  'funnel': FunnelBhHiringFunnel,
  'compact': CompactBhHiringFunnel,
};
