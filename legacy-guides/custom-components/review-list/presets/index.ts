import type { ComponentType } from 'react';
import type { ReviewListPreset, ReviewListProps } from '../core';

import Standard from './standard';
import Compact from './compact';

export const PRESETS: Record<ReviewListPreset, ComponentType<ReviewListProps>> = {
  standard: Standard,
  compact: Compact,
};
