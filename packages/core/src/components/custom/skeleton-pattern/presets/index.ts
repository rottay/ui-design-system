import React from 'react';
import type { SkeletonPatternPreset } from '../core';

import tablePreset from './table';
import cardPreset from './card';
import profilePreset from './profile';
import listPreset from './list';

export const table = tablePreset;
export const card = cardPreset;
export const profile = profilePreset;
export const list = listPreset;

export const PRESETS: Record<SkeletonPatternPreset, React.ComponentType<any>> = {
  table: tablePreset,
  card: cardPreset,
  profile: profilePreset,
  list: listPreset,
};
