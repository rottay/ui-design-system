/**
 * EvPurchaseOrders - Core Interface
 * Purchase order workflow
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvPurchaseOrdersPreset = 'list' | 'detail';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "ordered" | "received";
  items: Array<{ name: string;
  quantity: number;
  unitPrice: number;
  received: number }>;
  totalAmount: number;
  createdAt: Date;
  expectedDate: Date;
}

export interface EvPurchaseOrdersProps extends EngineAwareProps {
  preset?: EvPurchaseOrdersPreset;
  orders?: PurchaseOrder[];
  onOrderClick?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCreateOrder?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_PURCHASE_ORDERS_DEFAULTS: Partial<EvPurchaseOrdersProps> = {
  preset: 'list',

};
