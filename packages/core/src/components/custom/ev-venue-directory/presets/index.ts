/**
 * EvVenueDirectory - All Presets
 */

export { CardsEvVenueDirectory } from './cards';
export { MapEvVenueDirectory } from './map';

import type { EvVenueDirectoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvVenueDirectoryProps } from '../core';
import { CardsEvVenueDirectory } from './cards';
import { MapEvVenueDirectory } from './map';

export const EV_VENUE_DIRECTORY_PRESETS: Record<EvVenueDirectoryPreset, ComponentType<EvVenueDirectoryProps>> = {
  cards: CardsEvVenueDirectory,
  map: MapEvVenueDirectory,
};
