import type { ComponentType } from 'react';
import type { MegaMenuPreset, MegaMenuProps } from '../core';

import Standard from './standard';
import Tabbed from './tabbed';

export const PRESETS: Record<MegaMenuPreset, ComponentType<MegaMenuProps>> = {
  standard: Standard,
  tabbed: Tabbed,
};
