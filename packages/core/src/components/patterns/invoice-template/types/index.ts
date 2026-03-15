/**
 * InvoiceTemplate - Pattern Component Types
 */

import type { PatternBaseProps } from '../../types';

export interface InvoiceCompany {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  logo?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceClient {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  email?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  number: string;
  date: string;
  dueDate?: string;
  company: InvoiceCompany;
  client: InvoiceClient;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  total: number;
  notes?: string;
  currency?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface InvoiceTemplateProps extends PatternBaseProps {
  /** Invoice data */
  invoice: InvoiceData;
  /** Print action handler */
  onPrint?: () => void;
  /** Export/download handler */
  onExport?: () => void;
  /** Show action buttons (hidden when printing) */
  showActions?: boolean;
}
