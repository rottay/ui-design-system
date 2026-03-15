import React from 'react';
import type { ProductGalleryProps } from './core';
import { PRODUCT_GALLERY_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ProductGalleryProps, ProductGalleryPreset, GalleryImage } from './core';
export { PRODUCT_GALLERY_DEFAULTS } from './core';

export function ProductGallery(props: ProductGalleryProps): React.ReactElement {
  const preset = props.preset ?? PRODUCT_GALLERY_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
ProductGallery.displayName = 'ProductGallery';
