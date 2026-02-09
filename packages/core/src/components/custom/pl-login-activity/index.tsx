/**
 * PlLoginActivity - Main Export
 * Track login activity with geographic location, device info, and success rates
 */

import type { PlLoginActivityProps } from './core';
import { PL_LOGIN_ACTIVITY_DEFAULTS } from './core';
import { PL_LOGIN_ACTIVITY_PRESETS } from './presets';

export { type PlLoginActivityProps, type PlLoginActivityPreset, PL_LOGIN_ACTIVITY_DEFAULTS } from './core';
export * from './presets';

export function PlLoginActivity(props: PlLoginActivityProps): React.ReactElement {
  const preset = props.preset ?? PL_LOGIN_ACTIVITY_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = PL_LOGIN_ACTIVITY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlLoginActivity.displayName = 'PlLoginActivity';
