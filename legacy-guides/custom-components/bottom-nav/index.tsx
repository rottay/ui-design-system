import React from 'react';
import type { BottomNavProps } from './core';
import { BOTTOM_NAV_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { BottomNavProps, BottomNavPreset, BottomNavItem } from './core';
export { BOTTOM_NAV_DEFAULTS } from './core';

export function BottomNav(props: BottomNavProps): React.ReactElement {
  const preset = props.preset ?? BOTTOM_NAV_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
BottomNav.displayName = 'BottomNav';
