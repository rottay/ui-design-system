import React from 'react';
import type { MegaMenuPreset } from '../core';

import Standard from './standard';
import Tabbed from './tabbed';

export const PRESETS: Record<MegaMenuPreset, React.ComponentType<any>> = {
  standard: Standard,
  tabbed: Tabbed,
};
