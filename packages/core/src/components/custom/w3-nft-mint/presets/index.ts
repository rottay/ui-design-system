/**
 * W3NftMint - All Presets
 */

export { FormW3NftMint } from './form';
export { WizardW3NftMint } from './wizard';

import type { W3NftMintPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3NftMintProps } from '../core';
import { FormW3NftMint } from './form';
import { WizardW3NftMint } from './wizard';

export const W3_NFT_MINT_PRESETS: Record<W3NftMintPreset, ComponentType<W3NftMintProps>> = {
  form: FormW3NftMint,
  wizard: WizardW3NftMint,
};
