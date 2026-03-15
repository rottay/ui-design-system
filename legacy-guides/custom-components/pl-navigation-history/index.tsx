/**
 * PlNavigationHistory - Main Export
 * View user navigation history with breadcrumb trails and page analytics
 */

import type { PlNavigationHistoryProps } from './core';
import { PL_NAVIGATION_HISTORY_DEFAULTS } from './core';
import { PL_NAVIGATION_HISTORY_PRESETS } from './presets';

export { type PlNavigationHistoryProps, type PlNavigationHistoryPreset, PL_NAVIGATION_HISTORY_DEFAULTS } from './core';
export * from './presets';

export function PlNavigationHistory(props: PlNavigationHistoryProps): React.ReactElement {
  const preset = props.preset ?? PL_NAVIGATION_HISTORY_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = PL_NAVIGATION_HISTORY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNavigationHistory.displayName = 'PlNavigationHistory';
