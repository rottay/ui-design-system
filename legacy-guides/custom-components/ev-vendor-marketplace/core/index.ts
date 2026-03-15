import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type VendorMarketplacePreset = 'marketplace' | 'management';

export interface Vendor {
  id: string;
  companyName: string;
  category: string;
  rating: number;
  priceRange: 'budget' | 'mid' | 'premium';
  availability: boolean;
  bookedEvents: number;
  contactEmail?: string;
}

export interface VendorBooking {
  id: string;
  vendorId: string;
  vendorName: string;
  eventId: string;
  status: 'pending' | 'confirmed' | 'setup' | 'active' | 'completed';
  contractValue: number;
  boothAssignment?: string;
  setupChecklist: { item: string; done: boolean }[];
}

export interface VendorMarketplaceProps extends EngineAwareProps {
  preset?: VendorMarketplacePreset;
  vendors?: Vendor[];
  bookings?: VendorBooking[];
  onVendorClick?: (vendorId: string) => void;
  onBookVendor?: (vendorId: string) => void;
  onUpdateChecklist?: (bookingId: string, itemIndex: number, done: boolean) => void;
  style?: CSSProperties;
  className?: string;
}

export const VENDOR_MARKETPLACE_DEFAULTS: Required<
  Pick<VendorMarketplaceProps, 'preset' | 'vendors' | 'bookings'>
> = {
  preset: 'marketplace',
  vendors: [],
  bookings: [],
};
