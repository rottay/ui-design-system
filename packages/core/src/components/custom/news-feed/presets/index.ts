import type { ComponentType } from 'react';
import type { NewsFeedPreset, NewsFeedProps } from '../core';

import Standard from './standard';
import Compact from './compact';

export const PRESETS: Record<NewsFeedPreset, ComponentType<NewsFeedProps>> = {
  standard: Standard,
  compact: Compact,
};
