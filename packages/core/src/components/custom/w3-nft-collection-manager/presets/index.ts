/**
 * W3NftCollectionManager - All Presets
 */

export { GalleryW3NftCollectionManager } from './gallery';
export { TableW3NftCollectionManager } from './table';

import type { W3NftCollectionManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3NftCollectionManagerProps } from '../core';
import { GalleryW3NftCollectionManager } from './gallery';
import { TableW3NftCollectionManager } from './table';

export const W3_NFT_COLLECTION_MANAGER_PRESETS: Record<W3NftCollectionManagerPreset, ComponentType<W3NftCollectionManagerProps>> = {
  gallery: GalleryW3NftCollectionManager,
  table: TableW3NftCollectionManager,
};
