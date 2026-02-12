/**
 * BarGoodsReceipt - Core Interface
 * Receiving dock form for incoming goods
 * Tables: bar_goods_receipts
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarGoodsReceiptPreset = 'form' | 'compact';

export interface ReceiptItem {
  id: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  condition: 'good' | 'damaged' | 'rejected';
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poNumber: string;
  supplierName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  items: ReceiptItem[];
  receivedBy: string;
  receivedAt?: string;
  deliveryNote?: string;
}

export interface BarGoodsReceiptProps extends EngineAwareProps {
  preset?: BarGoodsReceiptPreset;
  receipts?: GoodsReceipt[];
  activeReceipt?: GoodsReceipt;
  onReceiptSelect?: (receiptId: string) => void;
  onUpdateQuantity?: (receiptId: string, itemId: string, quantity: number) => void;
  onUpdateCondition?: (receiptId: string, itemId: string, condition: 'good' | 'damaged' | 'rejected') => void;
  onComplete?: (receiptId: string) => void;
  onReject?: (receiptId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_GOODS_RECEIPT_DEFAULTS: Partial<BarGoodsReceiptProps> = {
  preset: 'form',
};
