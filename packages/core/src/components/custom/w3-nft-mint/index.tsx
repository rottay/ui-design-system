/**
 * W3NftMint - Main Export
 * Mint new NFTs with metadata, media upload, and batch minting support
 */

import type { W3NftMintProps } from './core';
import { W3_NFT_MINT_DEFAULTS } from './core';
import { W3_NFT_MINT_PRESETS } from './presets';

export { type W3NftMintProps, type W3NftMintPreset, W3_NFT_MINT_DEFAULTS } from './core';
export * from './presets';

export function W3NftMint(props: W3NftMintProps): React.ReactElement {
  const preset = props.preset ?? W3_NFT_MINT_DEFAULTS.preset ?? 'form';
  const PresetComponent = W3_NFT_MINT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3NftMint.displayName = 'W3NftMint';
