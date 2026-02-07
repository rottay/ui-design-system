import type { PageShellPreset } from '../core';

import standard from './standard';
import compact from './compact';

export const PRESETS: Record<PageShellPreset, any> = {
  standard,
  compact,
};
