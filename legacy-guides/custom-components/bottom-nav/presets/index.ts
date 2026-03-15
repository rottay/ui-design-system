import type { ComponentType } from 'react';
import type { BottomNavPreset, BottomNavProps } from '../core';

import Standard from './standard';
import Labeled from './labeled';

export const PRESETS: Record<BottomNavPreset, ComponentType<BottomNavProps>> = {
  standard: Standard,
  labeled: Labeled,
};
