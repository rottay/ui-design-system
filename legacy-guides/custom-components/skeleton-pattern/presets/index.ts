import type { ComponentType } from 'react';
import type { SkeletonPatternPreset, SkeletonPatternProps } from '../core';

import cardPreset from './card';
import profilePreset from './profile';

export const card = cardPreset;
export const profile = profilePreset;

export const PRESETS: Record<SkeletonPatternPreset, ComponentType<SkeletonPatternProps>> = {
  card: cardPreset,
  profile: profilePreset,
};
