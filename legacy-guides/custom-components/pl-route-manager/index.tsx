/**
 * PlRouteManager - Main Export
 * Define and manage application routes with URL patterns and middleware
 */

import type { PlRouteManagerProps } from './core';
import { PL_ROUTE_MANAGER_DEFAULTS } from './core';
import { PL_ROUTE_MANAGER_PRESETS } from './presets';

export { type PlRouteManagerProps, type PlRouteManagerPreset, PL_ROUTE_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlRouteManager(props: PlRouteManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_ROUTE_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_ROUTE_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlRouteManager.displayName = 'PlRouteManager';
