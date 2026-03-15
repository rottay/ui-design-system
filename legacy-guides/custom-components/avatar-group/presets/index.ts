import type { AvatarGroupPreset, AvatarGroupProps } from '../core';
import { StackedPreset } from './stacked';
import { GridPreset } from './grid';

export const PRESETS: Record<
  AvatarGroupPreset,
  React.ComponentType<AvatarGroupProps>
> = {
  stacked: StackedPreset,
  grid: GridPreset,
};
