import React from 'react';
import type { NewsFeedPreset } from '../core';

import Standard from './standard';
import Compact from './compact';

export const PRESETS: Record<NewsFeedPreset, React.ComponentType<any>> = {
  standard: Standard,
  compact: Compact,
};
