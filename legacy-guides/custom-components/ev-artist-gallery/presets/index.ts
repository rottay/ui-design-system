/**
 * EvArtistGallery - All Presets
 */

export { CardsEvArtistGallery } from './cards';
export { ListEvArtistGallery } from './list';

import type { EvArtistGalleryPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvArtistGalleryProps } from '../core';
import { CardsEvArtistGallery } from './cards';
import { ListEvArtistGallery } from './list';

export const EV_ARTIST_GALLERY_PRESETS: Record<EvArtistGalleryPreset, ComponentType<EvArtistGalleryProps>> = {
  cards: CardsEvArtistGallery,
  list: ListEvArtistGallery,
};
