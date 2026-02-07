import React from 'react';
import type { ReviewListPreset } from '../core';

import Standard from './standard';
import Compact from './compact';

export const PRESETS: Record<ReviewListPreset, React.ComponentType<any>> = {
  standard: Standard,
  compact: Compact,
};
