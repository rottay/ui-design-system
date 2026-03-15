import type { MaintenancePagePreset, MaintenancePageProps } from '../core';
import { MaintenancePreset } from './maintenance';
import { ComingSoonPreset } from './coming-soon';

export const PRESETS: Record<
  MaintenancePagePreset,
  React.ComponentType<MaintenancePageProps>
> = {
  maintenance: MaintenancePreset,
  'coming-soon': ComingSoonPreset,
};
