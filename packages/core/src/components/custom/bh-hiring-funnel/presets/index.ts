/**
 * BhHiringFunnel - All Presets
 */

import type { BhHiringFunnelPreset } from '../core';
import { FunnelBhHiringFunnel } from './funnel';
import { CompactBhHiringFunnel } from './compact';

export { FunnelBhHiringFunnel } from './funnel';
export { CompactBhHiringFunnel } from './compact';

export const BH_HIRING_FUNNEL_PRESETS: Record<BhHiringFunnelPreset, React.ComponentType<any>> = {
  'funnel': FunnelBhHiringFunnel,
  'compact': CompactBhHiringFunnel,
};
