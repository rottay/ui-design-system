import type { ComponentType } from 'react';
import type { TabNavPreset, TabNavProps } from '../core';

import Underline from './underline';
import Pills from './pills';
import Boxed from './boxed';

export const PRESETS: Record<TabNavPreset, ComponentType<TabNavProps>> = {
  underline: Underline,
  pills: Pills,
  boxed: Boxed,
};
