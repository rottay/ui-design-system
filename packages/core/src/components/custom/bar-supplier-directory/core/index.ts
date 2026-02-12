/**
 * BarSupplierDirectory - Core Interface
 * Supplier management table
 * Tables: bar_suppliers
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarSupplierDirectoryPreset = 'table' | 'cards';

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  isActive: boolean;
  address?: string;
  leadTimeDays: number;
}

export interface BarSupplierDirectoryProps extends EngineAwareProps {
  preset?: BarSupplierDirectoryPreset;
  suppliers?: Supplier[];
  onSupplierSelect?: (supplierId: string) => void;
  onSupplierCreate?: () => void;
  onSupplierEdit?: (supplierId: string) => void;
  onCreateOrder?: (supplierId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_SUPPLIER_DIRECTORY_DEFAULTS: Partial<BarSupplierDirectoryProps> = {
  preset: 'table',
};
