import type { ParkingTransportProps } from './core';
import { PARKING_TRANSPORT_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  ParkingTransportProps,
  ParkingLot,
  ShuttleRoute,
  RideshareZone,
  ParkingTransportPreset,
} from './core';

export type EvParkingTransportProps = ParkingTransportProps;

export function ParkingTransport(props: ParkingTransportProps) {
  const { preset = PARKING_TRANSPORT_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

ParkingTransport.displayName = 'ParkingTransport';

export const EvParkingTransport = ParkingTransport;
export { OverviewEvParkingTransport, WayfindingEvParkingTransport } from './presets';
