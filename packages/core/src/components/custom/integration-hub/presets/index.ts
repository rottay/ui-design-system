import type { IntegrationHubPreset, IntegrationHubProps } from '../core';
import { GridPreset } from './grid';
import { ListPreset } from './list';

export const PRESETS: Record<
  IntegrationHubPreset,
  React.ComponentType<IntegrationHubProps>
> = {
  grid: GridPreset,
  list: ListPreset,
};
