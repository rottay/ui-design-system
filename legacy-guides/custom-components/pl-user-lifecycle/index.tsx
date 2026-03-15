/**
 * PlUserLifecycle - Main Export
 * Track user lifecycle stages from onboarding through offboarding with status transitions
 */

import type { PlUserLifecycleProps } from './core';
import { PL_USER_LIFECYCLE_DEFAULTS } from './core';
import { PL_USER_LIFECYCLE_PRESETS } from './presets';

export { type PlUserLifecycleProps, type PlUserLifecyclePreset, PL_USER_LIFECYCLE_DEFAULTS } from './core';
export * from './presets';

export function PlUserLifecycle(props: PlUserLifecycleProps): React.ReactElement {
  const preset = props.preset ?? PL_USER_LIFECYCLE_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = PL_USER_LIFECYCLE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlUserLifecycle.displayName = 'PlUserLifecycle';
