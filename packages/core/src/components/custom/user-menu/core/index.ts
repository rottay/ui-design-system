/**
 * UserMenu - Core Interface
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type UserMenuPreset = 'avatar' | 'named' | 'detailed';

export interface UserMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface UserMenuProps extends EngineAwareProps, Record<string, unknown> {
  preset?: UserMenuPreset;
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  items?: UserMenuItem[];
  onLogout?: () => void;
  showLogout?: boolean;
}

export const USER_MENU_DEFAULTS: Partial<UserMenuProps> = {
  preset: 'named',
  showLogout: true,
};
