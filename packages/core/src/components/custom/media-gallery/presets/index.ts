import React from 'react';
import type { MediaGalleryPreset } from '../core';

import Masonry from './masonry';
import Grid from './grid';
import List from './list';

export const PRESETS: Record<MediaGalleryPreset, React.ComponentType<any>> = {
  masonry: Masonry,
  grid: Grid,
  list: List,
};
