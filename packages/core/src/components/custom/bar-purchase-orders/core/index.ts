/**
 * BarPurchaseOrders - Core Interface
 * PO management with create/approve/receive workflow
 * Tables: bar_purchase_orders, bar_purchase_order_items
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarPurchaseOrdersPreset = 'table' | 'kanban';

export type POStatus = 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  status: POStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  expectedDelivery?: string;
  createdBy: string;
  approvedBy?: string;
}

export interface BarPurchaseOrdersProps extends EngineAwareProps {
  preset?: BarPurchaseOrdersPreset;
  orders?: PurchaseOrder[];
  onOrderSelect?: (orderId: string) => void;
  onCreateOrder?: () => void;
  onApprove?: (orderId: string) => void;
  onReceive?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_PURCHASE_ORDERS_DEFAULTS: Partial<BarPurchaseOrdersProps> = {
  preset: 'table',
};
