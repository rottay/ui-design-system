import React from 'react';
import type { ProfileCardPreset } from '../core';

import Standard from './standard';
import Horizontal from './horizontal';
import Minimal from './minimal';

export const PRESETS: Record<ProfileCardPreset, React.ComponentType<any>> = {
  standard: Standard,
  horizontal: Horizontal,
  minimal: Minimal,
};
