/**
 * QuotaUsageMeter - All Presets
 */

import type { QuotaUsageMeterPreset } from '../core';
import { BarsQuotaUsageMeter } from './bars';
import { CardsQuotaUsageMeter } from './cards';
import { CompactQuotaUsageMeter } from './compact';

export { BarsQuotaUsageMeter } from './bars';
export { CardsQuotaUsageMeter } from './cards';
export { CompactQuotaUsageMeter } from './compact';

export const QUOTA_USAGE_METER_PRESETS: Record<QuotaUsageMeterPreset, React.ComponentType<any>> = {
  bars: BarsQuotaUsageMeter,
  cards: CardsQuotaUsageMeter,
  compact: CompactQuotaUsageMeter,
};
