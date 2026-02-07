import type { StatusBadgeGroupPreset, StatusBadgeGroupProps } from '../core';
import { DotsPreset } from './dots';
import { PillsPreset } from './pills';

export const PRESETS: Record<
  StatusBadgeGroupPreset,
  React.ComponentType<StatusBadgeGroupProps>
> = {
  dots: DotsPreset,
  pills: PillsPreset,
};
