import React from 'react';
import type { BottomNavPreset } from '../core';

import Standard from './standard';
import Labeled from './labeled';

export const PRESETS: Record<BottomNavPreset, React.ComponentType<any>> = {
  standard: Standard,
  labeled: Labeled,
};
