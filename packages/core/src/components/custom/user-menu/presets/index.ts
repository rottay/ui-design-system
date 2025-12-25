/**
 * UserMenu - All Presets
 */

import type { UserMenuPreset } from '../core';
import { AvatarUserMenu } from './avatar';
import { NamedUserMenu } from './named';
import { DetailedUserMenu } from './detailed';

export { AvatarUserMenu } from './avatar';
export { NamedUserMenu } from './named';
export { DetailedUserMenu } from './detailed';

export const USER_MENU_PRESETS: Record<UserMenuPreset, React.ComponentType<any>> = {
  avatar: AvatarUserMenu,
  named: NamedUserMenu,
  detailed: DetailedUserMenu,
};
