import type { ComponentType } from 'react';
import type { ProfileCardPreset, ProfileCardProps } from '../core';

import Standard from './standard';
import Horizontal from './horizontal';
import Minimal from './minimal';

export const PRESETS: Record<ProfileCardPreset, ComponentType<ProfileCardProps>> = {
  standard: Standard,
  horizontal: Horizontal,
  minimal: Minimal,
};
