import type { ComponentType } from 'react';
import type { MobileNavPreset, MobileNavProps } from '../core';

import Drawer from './drawer';
import BottomSheet from './bottom-sheet';

export const PRESETS: Record<MobileNavPreset, ComponentType<MobileNavProps>> = {
  drawer: Drawer,
  'bottom-sheet': BottomSheet,
};
