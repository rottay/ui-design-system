'use client';

/**
 * @fileoverview InvoiceTemplate -- Rustic engine (Vanilla / CSS variables).
 * Full invoice document rendered with pure inline styles referencing
 * --ds-* design tokens. No Ant Design or Tailwind dependency.
 * All visual properties (colors, radii, font sizes) flow from the
 * tenant's CSS custom properties, enabling full theme portability.
 * The "no-print" CSS class hides action buttons during printing.
 *
 * @example
 * <RusticInvoiceTemplate
 *   invoice={{ number: 'INV-001', date: '2026-03-01', company: { name: 'Acme' }, client: { name: 'Corp' }, items: [], subtotal: 0, tax: 0, total: 0 }}
 *   onPrint={() => window.print()}
 * />
 */

import React, { type CSSProperties } from 'react';
import type { InvoiceTemplateProps } from '../InvoiceTemplate.types';

const ROOT_CLASS_NAME = 'ds-pattern-invoice-template ds-engine-rustic';

/** Outer container -- constrains invoice width and centers it horizontally */
const containerStyle: CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  padding: 32,
};

/** Lightweight button style */
const btnStyle: CSSProperties = {
  padding: '6px 14px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
  cursor: 'pointer',
  fontWeight: 500,
};

/** Table header cell style -- uppercase labels */
const thStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
};

/** Table data cell style */
const tdStyle: CSSProperties = {
  padding: '10px 12px',
  fontSize: 'var(--ds-font-size-sm, 14px)',
};

/**
 * Rustic (Vanilla CSS) implementation of the InvoiceTemplate pattern.
 * Styling combines authored engine CSS with bounded runtime layout values.
 * The table is native HTML addressed through stable anatomy attributes.
 *
 * @param props - See {@link InvoiceTemplateProps} for the full prop contract.
 * @returns The rendered invoice template.
 */
export default function RusticInvoiceTemplate(props: InvoiceTemplateProps) {
  const {
    invoice,
    onPrint,
    onExport,
    showActions = true,
    loading,
    className,
    style,
  } = props;

  /* Default currency symbol when none provided on the invoice data */
  const cur = invoice.currency || '$';
  /** Formats a numeric amount with the invoice currency prefix, always 2 decimal places */
  const formatCurrency = (amount: number) => `${cur}${amount.toFixed(2)}`;

  /* Text-only loading state -- no spinner dependency since this engine avoids frameworks */
  if (loading) {
    return (
      <div data-part="root" data-loading="true" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...containerStyle, textAlign: 'center', padding: 48, ...style }}>
        <span data-part="loading-text">Loading...</span>
      </div>
    );
  }

  /** Reusable section box for "Bill To" and "Notes" panels */
  const sectionBg: CSSProperties = {
    padding: 16,
    marginBottom: 24,
  };

  /** Section label style -- uppercase, muted, small font for "Bill To" / "Notes" headings */
  const labelStyle: CSSProperties = {
    fontSize: 'var(--ds-font-size-xs, 12px)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    opacity: 0.6,
    marginBottom: 4,
  };

  return (
    <div data-part="root" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={{ ...containerStyle, ...style }}>
      {/* Actions */}
      {showActions && (onPrint || onExport) && (
        <div data-part="actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }} className="no-print">
          {onPrint && <button data-part="print-button" style={btnStyle} onClick={onPrint}>Print</button>}
          {onExport && <button data-part="export-button" style={btnStyle} onClick={onExport}>Export</button>}
        </div>
      )}

      {/* Header -- company branding on left, invoice metadata on right */}
      <div data-part="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          {/* Company logo is optional; falls back to name-only when absent */}
          {invoice.company.logo && (
            <img data-part="company-logo" src={invoice.company.logo} alt={invoice.company.name} style={{ height: 48, marginBottom: 8 }} />
          )}
          <div data-part="company-name" style={{ fontSize: 20, fontWeight: 700 }}>{invoice.company.name}</div>
          {invoice.company.address && <div data-part="company-address-line" data-field="address" style={{ fontSize: 12 }}>{invoice.company.address}</div>}
          {invoice.company.city && (
            <div data-part="company-address-line" data-field="city" style={{ fontSize: 12 }}>
              {invoice.company.city}{invoice.company.country ? `, ${invoice.company.country}` : ''}
            </div>
          )}
          {invoice.company.taxId && <div data-part="company-address-line" data-field="taxId" style={{ fontSize: 12 }}>Tax ID: {invoice.company.taxId}</div>}
          {invoice.company.email && <div data-part="company-address-line" data-field="email" style={{ fontSize: 12 }}>{invoice.company.email}</div>}
        </div>
        {/* Invoice metadata -- watermark at 10% opacity for a subtle document label */}
        <div data-part="metadata" style={{ textAlign: 'right' }}>
          <div data-part="watermark" style={{ fontSize: 28, fontWeight: 800, opacity: 0.1, marginBottom: 8 }}>INVOICE</div>
          <div data-part="metadata-line" data-field="number" style={{ fontSize: 14 }}><strong>Invoice #:</strong> {invoice.number}</div>
          <div data-part="metadata-line" data-field="date" style={{ fontSize: 14 }}><strong>Date:</strong> {invoice.date}</div>
          {invoice.dueDate && <div data-part="metadata-line" data-field="dueDate" style={{ fontSize: 14 }}><strong>Due:</strong> {invoice.dueDate}</div>}
          {/* Status badge -- the four status colours are keyed off data-status in the
              skin, which also carries the hardcoded white text those colours assume. */}
          {invoice.status && (
            <div data-part="status-badge" data-status={invoice.status} style={{
              display: 'inline-block',
              padding: '2px 10px',
              fontSize: 'var(--ds-font-size-xs, 12px)',
              fontWeight: 600,
              marginTop: 8,
            }}>
              {invoice.status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Bill To */}
      <div data-part="bill-to" style={sectionBg}>
        <div data-part="section-label" style={labelStyle}>Bill To</div>
        <div data-part="client-name" style={{ fontWeight: 600 }}>{invoice.client.name}</div>
        {invoice.client.address && <div data-part="client-address-line" data-field="address" style={{ fontSize: 12 }}>{invoice.client.address}</div>}
        {invoice.client.city && (
          <div data-part="client-address-line" data-field="city" style={{ fontSize: 12 }}>
            {invoice.client.city}{invoice.client.country ? `, ${invoice.client.country}` : ''}
          </div>
        )}
        {invoice.client.taxId && <div data-part="client-address-line" data-field="taxId" style={{ fontSize: 12 }}>Tax ID: {invoice.client.taxId}</div>}
        {invoice.client.email && <div data-part="client-address-line" data-field="email" style={{ fontSize: 12 }}>{invoice.client.email}</div>}
      </div>

      {/* Line Items -- native HTML table with manually applied thStyle/tdStyle from above.
          borderCollapse ensures consistent cell borders without double-line artifacts. */}
      <table data-part="items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr data-part="items-header-row">
            <th data-part="items-header-cell" data-col="index" style={{ ...thStyle, width: 40, textAlign: 'left' }}>#</th>
            <th data-part="items-header-cell" data-col="description" style={{ ...thStyle, textAlign: 'left' }}>Description</th>
            <th data-part="items-header-cell" data-col="quantity" style={{ ...thStyle, width: 60, textAlign: 'center' }}>Qty</th>
            <th data-part="items-header-cell" data-col="unit-price" style={{ ...thStyle, width: 110, textAlign: 'right' }}>Unit Price</th>
            <th data-part="items-header-cell" data-col="total" style={{ ...thStyle, width: 110, textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id} data-part="items-row">
              <td data-part="items-cell" data-col="index" style={tdStyle}>{i + 1}</td>
              <td data-part="items-cell" data-col="description" style={tdStyle}>{item.description}</td>
              <td data-part="items-cell" data-col="quantity" style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
              <td data-part="items-cell" data-col="unit-price" style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
              <td data-part="items-cell" data-col="total" style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals -- fixed 280px column right-aligned for consistent number alignment */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div data-part="totals" style={{ width: 280 }}>
          <div data-part="totals-row" data-row="subtotal" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {/* Tax line -- muted color to de-emphasize relative to grand total */}
          <div data-part="totals-row" data-row="tax" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
            <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          {/* Horizontal rule separating subtotal/tax from the grand total */}
          <div data-part="totals-divider" style={{ margin: '8px 0' }} />
          {/* Grand total -- larger font makes this the visual focal point */}
          <div data-part="totals-row" data-row="total" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 18, fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes -- pre-wrap preserves user-entered line breaks in the notes field */}
      {invoice.notes && (
        <div data-part="notes" style={{ ...sectionBg, marginTop: 32, marginBottom: 0 }}>
          <div data-part="section-label" style={labelStyle}>Notes</div>
          <div data-part="notes-text" style={{ fontSize: 'var(--ds-font-size-sm, 14px)', whiteSpace: 'pre-wrap' }}>
            {invoice.notes}
          </div>
        </div>
      )}
    </div>
  );
}
