/**
 * EvVenueDirectory - Core Interface
 * Venue directory with card/map view
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvVenueDirectoryPreset = 'cards' | 'map';

export interface VenueCard {
  id: string;
  name: string;
  address: string;
  city: string;
  image?: string;
  capacity: number;
  zonesCount: number;
  stagesCount: number;
  rating: number;
  isAvailable: boolean;
}

export interface VenueFilter {
  city?: string;
  minCapacity?: number;
  maxCapacity?: number;
  search?: string;
  available?: boolean;
}

export interface EvVenueDirectoryProps extends EngineAwareProps {
  preset?: EvVenueDirectoryPreset;
  venues?: VenueCard[];
  filters?: VenueFilter;
  onVenueClick?: (venueId: string) => void;
  onFilterChange?: (filters: VenueFilter) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_VENUE_DIRECTORY_DEFAULTS: Partial<EvVenueDirectoryProps> = {
  preset: 'cards',

};
