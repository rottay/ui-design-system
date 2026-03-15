import type { BadgeShowcasePreset, BadgeShowcaseProps } from '../core';
import { GridPreset } from './grid';
import { ListPreset } from './list';

export const PRESETS: Record<
  BadgeShowcasePreset,
  React.ComponentType<BadgeShowcaseProps>
> = {
  grid: GridPreset,
  list: ListPreset,
};
