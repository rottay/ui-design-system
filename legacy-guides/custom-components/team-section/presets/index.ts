import type { TeamSectionProps, TeamSectionPreset } from '../core';
import { GridPreset } from './grid';
import { CarouselPreset } from './carousel';

export const PRESETS: Record<TeamSectionPreset, React.ComponentType<TeamSectionProps>> = {
  grid: GridPreset,
  carousel: CarouselPreset,
};
