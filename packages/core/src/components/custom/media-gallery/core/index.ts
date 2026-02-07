import type { EngineAwareProps } from '../../../../types';

export type MediaGalleryPreset = 'masonry' | 'grid' | 'list';

export interface MediaItem {
  id: string;
  src: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

export interface MediaGalleryProps extends EngineAwareProps {
  preset?: MediaGalleryPreset;
  items: MediaItem[];
  onSelect?: (item: MediaItem) => void;
  columns?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MEDIA_GALLERY_DEFAULTS = {
  preset: 'masonry' as MediaGalleryPreset,
  columns: 3,
};
