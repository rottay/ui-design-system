import type { AppShellPreset } from '../core';

import standard from './standard';
import stacked from './stacked';

export const PRESETS: Record<AppShellPreset, any> = {
  standard,
  stacked,
};
