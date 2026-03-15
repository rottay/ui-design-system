import type { ComponentType } from 'react';
import type { SplitLayoutPreset, SplitLayoutProps } from '../core';

import Resizable from './resizable';

export const PRESETS: Record<SplitLayoutPreset, ComponentType<SplitLayoutProps>> = {
  resizable: Resizable,
};
