/**
 * EvResaleMarketplace - Core Interface
 * Ticket resale marketplace
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvResaleMarketplacePreset = 'browse' | 'manage';

export interface ResaleListing {
  id: string;
  ticketType: string;
  eventName: string;
  originalPrice: number;
  askingPrice: number;
  sellerName: string;
  sellerRating: number;
  status: "active" | "sold" | "expired";
}

export interface ResaleFilter {
  eventId?: string;
  maxPrice?: number;
  search?: string;
}

export interface EvResaleMarketplaceProps extends EngineAwareProps {
  preset?: EvResaleMarketplacePreset;
  listings?: ResaleListing[];
  filters?: ResaleFilter;
  onBuy?: (listingId: string) => void;
  onFilterChange?: (filters: ResaleFilter) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_RESALE_MARKETPLACE_DEFAULTS: Partial<EvResaleMarketplaceProps> = {
  preset: 'browse',

};
