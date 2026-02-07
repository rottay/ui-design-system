import type { AppShellPreset } from '../core';

import standard from './standard';
import stacked from './stacked';
import horizontal from './horizontal';

export const PRESETS: Record<AppShellPreset, any> = {
  standard,
  stacked,
  horizontal,
};
