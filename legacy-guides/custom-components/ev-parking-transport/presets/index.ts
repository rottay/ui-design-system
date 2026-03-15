export { OverviewEvParkingTransport } from './overview';
export { WayfindingEvParkingTransport } from './wayfinding';

import type { ParkingTransportPreset } from '../core';
import type { ComponentType } from 'react';
import type { ParkingTransportProps } from '../core';
import { OverviewEvParkingTransport } from './overview';
import { WayfindingEvParkingTransport } from './wayfinding';

export const PRESETS: Record<
  ParkingTransportPreset,
  ComponentType<ParkingTransportProps>
> = {
  overview: OverviewEvParkingTransport,
  wayfinding: WayfindingEvParkingTransport,
};
