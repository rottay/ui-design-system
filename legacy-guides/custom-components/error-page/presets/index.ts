import type { ErrorPagePreset } from '../core';

import standard from './standard';
import minimal from './minimal';

export const PRESETS: Record<ErrorPagePreset, any> = {
  standard,
  minimal,
};
