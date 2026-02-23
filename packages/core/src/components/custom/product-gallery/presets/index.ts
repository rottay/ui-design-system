import type { ComponentType } from 'react';
import type { ProductGalleryPreset, ProductGalleryProps } from '../core';

import Grid from './grid';
import Slider from './slider';

export const PRESETS: Record<ProductGalleryPreset, ComponentType<ProductGalleryProps>> = {
  grid: Grid,
  slider: Slider,
};
