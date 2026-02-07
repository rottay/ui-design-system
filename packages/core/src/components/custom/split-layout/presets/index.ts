import React from 'react';
import type { SplitLayoutPreset } from '../core';

import Resizable from './resizable';
import Fixed from './fixed';
import Responsive from './responsive';

export const PRESETS: Record<SplitLayoutPreset, React.ComponentType<any>> = {
  resizable: Resizable,
  fixed: Fixed,
  responsive: Responsive,
};
