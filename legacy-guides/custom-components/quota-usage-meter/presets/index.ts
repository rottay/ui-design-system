/**
 * QuotaUsageMeter - All Presets
 */

import type { QuotaUsageMeterPreset, QuotaUsageMeterProps } from '../core';
import type { ComponentType } from 'react';
import { BarsQuotaUsageMeter } from './bars';
import { CardsQuotaUsageMeter } from './cards';
import { CompactQuotaUsageMeter } from './compact';

export { BarsQuotaUsageMeter } from './bars';
export { CardsQuotaUsageMeter } from './cards';
export { CompactQuotaUsageMeter } from './compact';

export const QUOTA_USAGE_METER_PRESETS: Record<QuotaUsageMeterPreset, ComponentType<QuotaUsageMeterProps>> = {
  bars: BarsQuotaUsageMeter,
  cards: CardsQuotaUsageMeter,
  compact: CompactQuotaUsageMeter,
};
