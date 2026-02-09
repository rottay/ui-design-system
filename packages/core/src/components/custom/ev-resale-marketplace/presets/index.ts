/**
 * EvResaleMarketplace - All Presets
 */

export { BrowseEvResaleMarketplace } from './browse';
export { ManageEvResaleMarketplace } from './manage';

import type { EvResaleMarketplacePreset } from '../core';
import type { ComponentType } from 'react';
import type { EvResaleMarketplaceProps } from '../core';
import { BrowseEvResaleMarketplace } from './browse';
import { ManageEvResaleMarketplace } from './manage';

export const EV_RESALE_MARKETPLACE_PRESETS: Record<EvResaleMarketplacePreset, ComponentType<EvResaleMarketplaceProps>> = {
  browse: BrowseEvResaleMarketplace,
  manage: ManageEvResaleMarketplace,
};
