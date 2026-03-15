/**
 * SubscriptionManager - Main Export
 * Automatically selects preset based on props
 */

import type { SubscriptionManagerProps } from './core';
import { SUBSCRIPTION_MANAGER_DEFAULTS } from './core';
import { SUBSCRIPTION_MANAGER_PRESETS } from './presets';

export { type SubscriptionManagerProps, type SubscriptionManagerPreset, type Subscription, type SubscriptionPlan, type SubscriptionFeature, type SubscriptionStatus, type BillingInterval, type BillingEvent, type UsageMetric, SUBSCRIPTION_MANAGER_DEFAULTS } from './core';
export { getSubscriptionStatusColors, formatCurrency, getBillingEventColors } from './core';
export * from './presets';

/**
 * SubscriptionManager component
 * Renders the appropriate preset based on the preset prop
 */
export function SubscriptionManager(props: SubscriptionManagerProps): React.ReactElement {
  const preset = props.preset ?? SUBSCRIPTION_MANAGER_DEFAULTS.preset ?? 'current';
  const PresetComponent = SUBSCRIPTION_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SubscriptionManager.displayName = 'SubscriptionManager';

export { CurrentSubscriptionManager, PlansSubscriptionManager, HistorySubscriptionManager } from './presets';
