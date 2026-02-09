import React from 'react';
import type { SplitLayoutPreset } from '../core';

import Resizable from './resizable';

export const PRESETS: Record<SplitLayoutPreset, React.ComponentType<any>> = {
  resizable: Resizable,
};
