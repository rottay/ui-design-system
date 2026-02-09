/**
 * PmSubscriptionLifecycle - All Presets
 */

export { PanelPmSubscriptionLifecycle } from './panel';
export { CompactPmSubscriptionLifecycle } from './compact';

import type { PmSubscriptionLifecyclePreset } from '../core';
import type { ComponentType } from 'react';
import type { PmSubscriptionLifecycleProps } from '../core';
import { PanelPmSubscriptionLifecycle } from './panel';
import { CompactPmSubscriptionLifecycle } from './compact';

export const PM_SUBSCRIPTION_LIFECYCLE_PRESETS: Record<PmSubscriptionLifecyclePreset, ComponentType<PmSubscriptionLifecycleProps>> = {
  panel: PanelPmSubscriptionLifecycle,
  compact: CompactPmSubscriptionLifecycle,
};
