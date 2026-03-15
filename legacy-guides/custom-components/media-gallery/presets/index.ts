import type { ComponentType } from 'react';
import type { MediaGalleryPreset, MediaGalleryProps } from '../core';

import Masonry from './masonry';
import Grid from './grid';
import List from './list';

export const PRESETS: Record<MediaGalleryPreset, ComponentType<MediaGalleryProps>> = {
  masonry: Masonry,
  grid: Grid,
  list: List,
};
