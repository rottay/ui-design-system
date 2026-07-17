/**
 * @fileoverview Type definitions for the InvoiceTemplate pattern. Defines
 * InvoiceCompany, InvoiceClient, InvoiceLineItem, InvoiceData (with status
 * and currency), and the top-level props for print/export actions.
 */

import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * Contact and branding details for the company issuing the invoice.
 * Displayed in the "From" / header section of the invoice template.
 */
export interface InvoiceCompany {
  /** Legal or trading name of the issuing company */
  name: string;
  /** Street address line */
  address?: string;
  /** City or locality */
  city?: string;
  /** Country name or ISO code */
  country?: string;
  /** Tax identification number (e.g. VAT, EIN) */
  taxId?: string;
  /** URL to the company logo displayed on the invoice header */
  logo?: string;
  /** Contact email address */
  email?: string;
  /** Contact phone number */
  phone?: string;
}

/**
 * Contact details for the client receiving the invoice.
 * Displayed in the "Bill To" section of the invoice template.
 */
export interface InvoiceClient {
  /** Legal or trading name of the client */
  name: string;
  /** Street address line */
  address?: string;
  /** City or locality */
  city?: string;
  /** Country name or ISO code */
  country?: string;
  /** Tax identification number (e.g. VAT, EIN) */
  taxId?: string;
  /** Client's email address for correspondence */
  email?: string;
}

/**
 * A single billable line item within an invoice.
 * The `total` should equal `quantity * unitPrice` but is provided
 * explicitly to support pre-calculated or discounted rows.
 */
export interface InvoiceLineItem {
  /** Unique identifier for this line item */
  id: string;
  /** Description of the product or service */
  description: string;
  /** Number of units billed */
  quantity: number;
  /** Price per unit in the invoice's currency */
  unitPrice: number;
  /** Total amount for this line item (quantity x unitPrice, or custom) */
  total: number;
}

/**
 * Complete data model for a single invoice.
 * Aggregates company/client info, line items, financial totals,
 * and metadata such as currency and payment status.
 */
export interface InvoiceData {
  /** Invoice number (e.g. "INV-2026-0042") */
  number: string;
  /** Issue date in ISO or locale string format */
  date: string;
  /** Payment due date in ISO or locale string format */
  dueDate?: string;
  /** Issuing company details */
  company: InvoiceCompany;
  /** Billing client details */
  client: InvoiceClient;
  /** Ordered list of billable line items */
  items: InvoiceLineItem[];
  /** Sum of all line item totals before tax */
  subtotal: number;
  /** Total tax amount */
  tax: number;
  /** Tax rate as a decimal (e.g. 0.21 for 21%) */
  taxRate?: number;
  /** Grand total including tax (subtotal + tax) */
  total: number;
  /** Additional notes or payment instructions displayed at the bottom */
  notes?: string;
  /** ISO 4217 currency code (e.g. "USD", "EUR"). Defaults to tenant currency */
  currency?: string;
  /** Current payment lifecycle status of the invoice */
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
}

/**
 * Props for the InvoiceTemplate pattern component.
 * Renders a print-ready invoice layout with company branding, line items,
 * financial summary, and optional print/export action buttons.
 *
 * @example
 * ```tsx
 * <InvoiceTemplate
 *   invoice={{
 *     number: 'INV-2026-0042',
 *     date: '2026-03-01',
 *     dueDate: '2026-04-01',
 *     company: { name: 'Acme Corp', taxId: 'US-123456' },
 *     client: { name: 'Client Inc.' },
 *     items: [{ id: '1', description: 'Consulting', quantity: 10, unitPrice: 150, total: 1500 }],
 *     subtotal: 1500,
 *     tax: 315,
 *     taxRate: 0.21,
 *     total: 1815,
 *     currency: 'USD',
 *     status: 'sent',
 *   }}
 *   onPrint={() => window.print()}
 *   onExport={() => downloadPdf(invoiceId)}
 *   showActions
 * />
 * ```
 */
export interface InvoiceTemplateProps extends PatternBaseProps {
  /** Complete invoice data object to render */
  invoice: InvoiceData;
  /** Handler invoked when the user clicks the print button */
  onPrint?: () => void;
  /** Handler invoked when the user clicks the export/download button */
  onExport?: () => void;
  /** Whether to display print/export action buttons (set to false when printing) */
  showActions?: boolean;
}
