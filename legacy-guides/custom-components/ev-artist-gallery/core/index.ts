/**
 * EvArtistGallery - Core Interface
 * Artist profile gallery
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvArtistGalleryPreset = 'cards' | 'list';

export interface ArtistProfile {
  id: string;
  name: string;
  photo?: string;
  genre: string;
  bio?: string;
  rating: number;
  eventsPlayed: number;
  contractStatus: "active" | "pending" | "expired" | "none";
}

export interface ArtistFilter {
  genre?: string;
  search?: string;
  contractStatus?: string;
  available?: boolean;
}

export interface EvArtistGalleryProps extends EngineAwareProps {
  preset?: EvArtistGalleryPreset;
  artists?: ArtistProfile[];
  filters?: ArtistFilter;
  onArtistClick?: (artistId: string) => void;
  onFilterChange?: (filters: ArtistFilter) => void;
  onInviteArtist?: (artistId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ARTIST_GALLERY_DEFAULTS: Partial<EvArtistGalleryProps> = {
  preset: 'cards',

};
