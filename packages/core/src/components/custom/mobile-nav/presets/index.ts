import React from 'react';
import type { MobileNavPreset } from '../core';

import Drawer from './drawer';
import BottomSheet from './bottom-sheet';

export const PRESETS: Record<MobileNavPreset, React.ComponentType<any>> = {
  drawer: Drawer,
  'bottom-sheet': BottomSheet,
};
