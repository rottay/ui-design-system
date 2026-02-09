/**
 * SubscriptionManager - All Presets
 */

import type { SubscriptionManagerPreset } from '../core';
import { CurrentSubscriptionManager } from './current';
import { PlansSubscriptionManager } from './plans';
import { HistorySubscriptionManager } from './history';

export { CurrentSubscriptionManager } from './current';
export { PlansSubscriptionManager } from './plans';
export { HistorySubscriptionManager } from './history';

export const SUBSCRIPTION_MANAGER_PRESETS: Record<SubscriptionManagerPreset, React.ComponentType<any>> = {
  current: CurrentSubscriptionManager,
  plans: PlansSubscriptionManager,
  history: HistorySubscriptionManager,
};
