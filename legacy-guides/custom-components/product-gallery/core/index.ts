import type { EngineAwareProps } from '../../../../types';

export type ProductGalleryPreset = 'grid' | 'slider';

export interface GalleryImage {
  id: string;
  src: string;
  thumbnail?: string;
  alt?: string;
}

export interface ProductGalleryProps extends EngineAwareProps {
  preset?: ProductGalleryPreset;
  images: GalleryImage[];
  onImageClick?: (image: GalleryImage) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PRODUCT_GALLERY_DEFAULTS = {
  preset: 'grid' as ProductGalleryPreset,
};
