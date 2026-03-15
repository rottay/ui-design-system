/**
 * EvSupplierHub - Core Interface
 * Supplier management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvSupplierHubPreset = 'directory' | 'orders';

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  rating: number;
  orderCount: number;
  totalSpent: number;
}

export interface SupplierOrder {
  id: string;
  supplierName: string;
  orderNumber: string;
  status: "draft" | "submitted" | "approved" | "ordered" | "received";
  totalAmount: number;
  expectedDate: Date;
}

export interface EvSupplierHubProps extends EngineAwareProps {
  preset?: EvSupplierHubPreset;
  suppliers?: Supplier[];
  orders?: SupplierOrder[];
  onSupplierClick?: (id: string) => void;
  onOrderClick?: (id: string) => void;
  onCreateOrder?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SUPPLIER_HUB_DEFAULTS: Partial<EvSupplierHubProps> = {
  preset: 'directory',

};
