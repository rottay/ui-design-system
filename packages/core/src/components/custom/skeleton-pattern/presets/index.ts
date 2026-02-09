import React from 'react';
import type { SkeletonPatternPreset } from '../core';

import cardPreset from './card';
import profilePreset from './profile';

export const card = cardPreset;
export const profile = profilePreset;

export const PRESETS: Record<SkeletonPatternPreset, React.ComponentType<any>> = {
  card: cardPreset,
  profile: profilePreset,
};
