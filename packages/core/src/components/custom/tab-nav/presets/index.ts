import React from 'react';
import type { TabNavPreset } from '../core';

import Underline from './underline';
import Pills from './pills';
import Boxed from './boxed';

export const PRESETS: Record<TabNavPreset, React.ComponentType<any>> = {
  underline: Underline,
  pills: Pills,
  boxed: Boxed,
};
