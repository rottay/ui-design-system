/**
 * EvServiceStation - All Presets
 */

export { MapEvServiceStation } from './map';
export { OperationsEvServiceStation } from './operations';

import type { EvServiceStationPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvServiceStationProps } from '../core';
import { MapEvServiceStation } from './map';
import { OperationsEvServiceStation } from './operations';

export const EV_SERVICE_STATION_PRESETS: Record<EvServiceStationPreset, ComponentType<EvServiceStationProps>> = {
  map: MapEvServiceStation,
  operations: OperationsEvServiceStation,
};
