/**
 * PmSubscriptionLifecycle - Main Export
 * Track subscription lifecycle from trial through active, paused, and cancelled states
 */

import type { PmSubscriptionLifecycleProps } from './core';
import { PM_SUBSCRIPTION_LIFECYCLE_DEFAULTS } from './core';
import { PM_SUBSCRIPTION_LIFECYCLE_PRESETS } from './presets';

export { type PmSubscriptionLifecycleProps, type PmSubscriptionLifecyclePreset, PM_SUBSCRIPTION_LIFECYCLE_DEFAULTS } from './core';
export * from './presets';

export function PmSubscriptionLifecycle(props: PmSubscriptionLifecycleProps): React.ReactElement {
  const preset = props.preset ?? PM_SUBSCRIPTION_LIFECYCLE_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PM_SUBSCRIPTION_LIFECYCLE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmSubscriptionLifecycle.displayName = 'PmSubscriptionLifecycle';
