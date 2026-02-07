import React from 'react';
import type { MobileNavProps } from './core';
import { MOBILE_NAV_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { MobileNavProps, MobileNavPreset, MobileNavItem } from './core';
export { MOBILE_NAV_DEFAULTS } from './core';

export function MobileNav(props: MobileNavProps): React.ReactElement {
  const preset = props.preset ?? MOBILE_NAV_DEFAULTS.preset ?? 'drawer';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
MobileNav.displayName = 'MobileNav';
