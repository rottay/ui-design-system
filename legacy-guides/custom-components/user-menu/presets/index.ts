/**
 * UserMenu - All Presets
 */

import type { UserMenuPreset, UserMenuProps } from '../core';
import type { ComponentType } from 'react';
import { AvatarUserMenu } from './avatar';
import { NamedUserMenu } from './named';
import { DetailedUserMenu } from './detailed';

export { AvatarUserMenu } from './avatar';
export { NamedUserMenu } from './named';
export { DetailedUserMenu } from './detailed';

export const USER_MENU_PRESETS: Record<UserMenuPreset, ComponentType<UserMenuProps>> = {
  avatar: AvatarUserMenu,
  named: NamedUserMenu,
  detailed: DetailedUserMenu,
};
