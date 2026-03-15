/**
 * UserMenu - Main Export
 * Automatically selects preset based on props
 */

// import React from 'react';
import type { UserMenuProps } from './core';
import { USER_MENU_DEFAULTS } from './core';
import { USER_MENU_PRESETS } from './presets';

export { type UserMenuProps, type UserMenuPreset, type UserMenuItem, USER_MENU_DEFAULTS } from './core';
export * from './presets';

/**
 * UserMenu component
 * Renders the appropriate preset based on the preset prop
 */
export function UserMenu(props: UserMenuProps): React.ReactElement {
  const preset = props.preset ?? USER_MENU_DEFAULTS.preset ?? 'named';
  const PresetComponent = USER_MENU_PRESETS[preset];

  return <PresetComponent {...props} />;
}

UserMenu.displayName = 'UserMenu';

// Also export individual presets as named exports for direct use
export { AvatarUserMenu, NamedUserMenu, DetailedUserMenu } from './presets';
