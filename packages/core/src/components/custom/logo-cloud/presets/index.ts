import type { LogoCloudProps, LogoCloudPreset } from '../core';
import { GridPreset } from './grid';
import { ScrollingPreset } from './scrolling';
import { TieredPreset } from './tiered';

export const PRESETS: Record<LogoCloudPreset, React.ComponentType<LogoCloudProps>> = {
  grid: GridPreset,
  scrolling: ScrollingPreset,
  tiered: TieredPreset,
};
