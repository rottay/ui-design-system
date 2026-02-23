/**
 * SubscriptionManager - All Presets
 */

import type { SubscriptionManagerPreset, SubscriptionManagerProps } from '../core';
import type { ComponentType } from 'react';
import { CurrentSubscriptionManager } from './current';
import { PlansSubscriptionManager } from './plans';
import { HistorySubscriptionManager } from './history';

export { CurrentSubscriptionManager } from './current';
export { PlansSubscriptionManager } from './plans';
export { HistorySubscriptionManager } from './history';

export const SUBSCRIPTION_MANAGER_PRESETS: Record<SubscriptionManagerPreset, ComponentType<SubscriptionManagerProps>> = {
  current: CurrentSubscriptionManager,
  plans: PlansSubscriptionManager,
  history: HistorySubscriptionManager,
};
