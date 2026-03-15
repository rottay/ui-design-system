/**
 * EvServiceStation - Main Export
 * Service points (bars, food trucks, merch) with queue, wait times, and stock indicators
 */

import type { EvServiceStationProps } from './core';
import { EV_SERVICE_STATION_DEFAULTS } from './core';
import { EV_SERVICE_STATION_PRESETS } from './presets';

export {
  type EvServiceStationProps,
  type EvServiceStationPreset,
  type ServicePoint as EvServiceStationServicePoint,
  EV_SERVICE_STATION_DEFAULTS,
} from './core';
export * from './presets';

export function EvServiceStation(props: EvServiceStationProps): React.ReactElement {
  const preset = props.preset ?? EV_SERVICE_STATION_DEFAULTS.preset ?? 'map';
  const PresetComponent = EV_SERVICE_STATION_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvServiceStation.displayName = 'EvServiceStation';

export { MapEvServiceStation, OperationsEvServiceStation } from './presets';
