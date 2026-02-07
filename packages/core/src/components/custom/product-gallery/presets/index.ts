import React from 'react';
import type { ProductGalleryPreset } from '../core';

import Grid from './grid';
import Slider from './slider';

export const PRESETS: Record<ProductGalleryPreset, React.ComponentType<any>> = {
  grid: Grid,
  slider: Slider,
};
