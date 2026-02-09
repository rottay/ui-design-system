export { GuestProfileFull } from './full';
export { GuestProfileCard } from './card';

import type { GuestProfilePreset } from '../core';
import type { ComponentType } from 'react';
import type { GuestProfileProps } from '../core';
import { GuestProfileFull } from './full';
import { GuestProfileCard } from './card';

export const PRESETS: Record<
  GuestProfilePreset,
  ComponentType<GuestProfileProps>
> = {
  full: GuestProfileFull,
  card: GuestProfileCard,
};
