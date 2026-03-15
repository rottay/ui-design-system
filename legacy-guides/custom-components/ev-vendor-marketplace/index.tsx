import type { VendorMarketplaceProps } from './core';
import { VENDOR_MARKETPLACE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  VendorMarketplaceProps,
  Vendor,
  VendorBooking,
  VendorMarketplacePreset,
} from './core';

export type EvVendorMarketplaceProps = VendorMarketplaceProps;

export function VendorMarketplace(props: VendorMarketplaceProps) {
  const { preset = VENDOR_MARKETPLACE_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

VendorMarketplace.displayName = 'VendorMarketplace';

export const EvVendorMarketplace = VendorMarketplace;
export { MarketplaceEvVendorMarketplace, ManagementEvVendorMarketplace } from './presets';
