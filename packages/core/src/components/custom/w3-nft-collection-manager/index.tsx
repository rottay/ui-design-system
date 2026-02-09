/**
 * W3NftCollectionManager - Main Export
 * Manage NFT collections with metadata, supply tracking, and batch operations
 */

import type { W3NftCollectionManagerProps } from './core';
import { W3_NFT_COLLECTION_MANAGER_DEFAULTS } from './core';
import { W3_NFT_COLLECTION_MANAGER_PRESETS } from './presets';

export { type W3NftCollectionManagerProps, type W3NftCollectionManagerPreset, W3_NFT_COLLECTION_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function W3NftCollectionManager(props: W3NftCollectionManagerProps): React.ReactElement {
  const preset = props.preset ?? W3_NFT_COLLECTION_MANAGER_DEFAULTS.preset ?? 'gallery';
  const PresetComponent = W3_NFT_COLLECTION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3NftCollectionManager.displayName = 'W3NftCollectionManager';
