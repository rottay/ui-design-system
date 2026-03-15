export { MarketplaceEvVendorMarketplace } from './marketplace';
export { ManagementEvVendorMarketplace } from './management';

import type { VendorMarketplacePreset } from '../core';
import type { ComponentType } from 'react';
import type { VendorMarketplaceProps } from '../core';
import { MarketplaceEvVendorMarketplace } from './marketplace';
import { ManagementEvVendorMarketplace } from './management';

export const PRESETS: Record<
  VendorMarketplacePreset,
  ComponentType<VendorMarketplaceProps>
> = {
  marketplace: MarketplaceEvVendorMarketplace,
  management: ManagementEvVendorMarketplace,
};
