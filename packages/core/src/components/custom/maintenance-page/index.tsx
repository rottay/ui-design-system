import type { MaintenancePageProps } from './core';
import { MAINTENANCE_PAGE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { MaintenancePageProps, MaintenancePagePreset } from './core';
export { MAINTENANCE_PAGE_DEFAULTS } from './core';

export function MaintenancePage(props: MaintenancePageProps): React.ReactElement {
  const preset = props.preset ?? MAINTENANCE_PAGE_DEFAULTS.preset ?? 'maintenance';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

MaintenancePage.displayName = 'MaintenancePage';
