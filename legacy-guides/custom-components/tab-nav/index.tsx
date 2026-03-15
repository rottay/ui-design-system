import React from 'react';
import type { TabNavProps } from './core';
import { TAB_NAV_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { TabNavProps, TabNavPreset, TabNavItem } from './core';
export { TAB_NAV_DEFAULTS } from './core';

export function TabNav(props: TabNavProps): React.ReactElement {
  const preset = props.preset ?? TAB_NAV_DEFAULTS.preset ?? 'underline';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
TabNav.displayName = 'TabNav';
