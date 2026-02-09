/**
 * EvResaleMarketplace - Main Export
 * Ticket resale marketplace
 * Automatically selects preset based on props
 */

import type { EvResaleMarketplaceProps } from './core';
import { EV_RESALE_MARKETPLACE_DEFAULTS } from './core';
import { EV_RESALE_MARKETPLACE_PRESETS } from './presets';

export {
  type EvResaleMarketplaceProps,
  type EvResaleMarketplacePreset,
  type ResaleListing as EvResaleMarketplaceResaleListing,
  type ResaleFilter as EvResaleMarketplaceResaleFilter,
  EV_RESALE_MARKETPLACE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvResaleMarketplace component
 * Renders the appropriate preset based on the preset prop
 */
export function EvResaleMarketplace(props: EvResaleMarketplaceProps): React.ReactElement {
  const preset = props.preset ?? EV_RESALE_MARKETPLACE_DEFAULTS.preset ?? 'browse';
  const PresetComponent = EV_RESALE_MARKETPLACE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvResaleMarketplace.displayName = 'EvResaleMarketplace';

export { BrowseEvResaleMarketplace, ManageEvResaleMarketplace } from './presets';
