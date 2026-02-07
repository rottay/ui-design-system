import React from 'react';
import type { MegaMenuProps } from './core';
import { MEGA_MENU_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { MegaMenuProps, MegaMenuPreset, MegaMenuGroup } from './core';
export { MEGA_MENU_DEFAULTS } from './core';

export function MegaMenu(props: MegaMenuProps): React.ReactElement {
  const preset = props.preset ?? MEGA_MENU_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
MegaMenu.displayName = 'MegaMenu';
