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

/** Maps invoice status to --ds-* color tokens for the status badge */
const statusColors: Record<string, string> = {
  draft: 'var(--ds-color-neutral-400)',
  sent: 'var(--ds-color-primary)',
  paid: 'var(--ds-color-success, #22c55e)',
  overdue: 'var(--ds-color-error, #ef4444)',
};

/** Outer container -- constrains invoice width and centers it horizontally */
const containerStyle: CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  border: '1px solid var(--ds-color-neutral-200, #e5e7eb)',
  borderRadius: 'var(--ds-radius-lg, 8px)',
  background: 'var(--ds-color-background, #fff)',
  padding: 32,
};

/** Lightweight button style using design tokens for border/radius */
const btnStyle: CSSProperties = {
  padding: '6px 14px',
  fontSize: 'var(--ds-font-size-sm, 13px)',
  borderRadius: 'var(--ds-radius-md, 6px)',
  border: '1px solid var(--ds-color-neutral-300, #d1d5db)',
  background: 'var(--ds-color-background, #fff)',
  color: 'var(--ds-color-text)',
  cursor: 'pointer',
  fontWeight: 500,
};

/** Table header cell style -- uppercase labels with a 2px bottom border */
const thStyle: CSSProperties = {
  padding: '8px 12px',
  fontSize: 'var(--ds-font-size-xs, 12px)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  color: 'var(--ds-color-text-muted)',
  borderBottom: '2px solid var(--ds-color-neutral-200, #e5e7eb)',
};

/** Table data cell style -- subtle 1px separator between rows */
const tdStyle: CSSProperties = {
  padding: '10px 12px',
  fontSize: 'var(--ds-font-size-sm, 13px)',
  borderBottom: '1px solid var(--ds-color-neutral-100, #f3f4f6)',
};

/**
 * Rustic (Vanilla CSS) implementation of the InvoiceTemplate pattern.
 * All styling uses inline CSSProperties with --ds-* token fallbacks.
 * The table is a native HTML table with manually applied styles.
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
      <div className={className} style={{ ...containerStyle, textAlign: 'center', padding: 48, ...style }}>
        <span style={{ color: 'var(--ds-color-text-muted)' }}>Loading...</span>
      </div>
    );
  }

  /** Reusable section background for "Bill To" and "Notes" panels */
  const sectionBg: CSSProperties = {
    padding: 16,
    background: 'var(--ds-color-neutral-50, #f9fafb)',
    borderRadius: 'var(--ds-radius-md, 6px)',
    marginBottom: 24,
  };

  /** Section label style -- uppercase, muted, small font for "Bill To" / "Notes" headings */
  const labelStyle: CSSProperties = {
    fontSize: 'var(--ds-font-size-xs, 11px)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    color: 'var(--ds-color-text-muted)',
    opacity: 0.6,
    marginBottom: 4,
  };

  return (
    <div className={className} style={{ ...containerStyle, ...style }}>
      {/* Actions */}
      {showActions && (onPrint || onExport) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }} className="no-print">
          {onPrint && <button style={btnStyle} onClick={onPrint}>Print</button>}
          {onExport && <button style={btnStyle} onClick={onExport}>Export</button>}
        </div>
      )}

      {/* Header -- company branding on left, invoice metadata on right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          {/* Company logo is optional; falls back to name-only when absent */}
          {invoice.company.logo && (
            <img src={invoice.company.logo} alt={invoice.company.name} style={{ height: 48, marginBottom: 8 }} />
          )}
          <div style={{ fontSize: 20, fontWeight: 700 }}>{invoice.company.name}</div>
          {invoice.company.address && <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{invoice.company.address}</div>}
          {invoice.company.city && (
            <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
              {invoice.company.city}{invoice.company.country ? `, ${invoice.company.country}` : ''}
            </div>
          )}
          {invoice.company.taxId && <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Tax ID: {invoice.company.taxId}</div>}
          {invoice.company.email && <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{invoice.company.email}</div>}
        </div>
        {/* Invoice metadata -- watermark at 10% opacity for a subtle document label */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, opacity: 0.1, marginBottom: 8 }}>INVOICE</div>
          <div style={{ fontSize: 14 }}><strong>Invoice #:</strong> {invoice.number}</div>
          <div style={{ fontSize: 14 }}><strong>Date:</strong> {invoice.date}</div>
          {invoice.dueDate && <div style={{ fontSize: 14 }}><strong>Due:</strong> {invoice.dueDate}</div>}
          {/* Status badge -- uses --ds-* color tokens from the statusColors map.
              White text is hardcoded since all status colors have sufficient contrast. */}
          {invoice.status && (
            <div style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 'var(--ds-radius-sm, 4px)',
              background: statusColors[invoice.status],
              color: '#fff',
              fontSize: 'var(--ds-font-size-xs, 11px)',
              fontWeight: 600,
              marginTop: 8,
            }}>
              {invoice.status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Bill To */}
      <div style={sectionBg}>
        <div style={labelStyle}>Bill To</div>
        <div style={{ fontWeight: 600 }}>{invoice.client.name}</div>
        {invoice.client.address && <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{invoice.client.address}</div>}
        {invoice.client.city && (
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>
            {invoice.client.city}{invoice.client.country ? `, ${invoice.client.country}` : ''}
          </div>
        )}
        {invoice.client.taxId && <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>Tax ID: {invoice.client.taxId}</div>}
        {invoice.client.email && <div style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{invoice.client.email}</div>}
      </div>

      {/* Line Items -- native HTML table with manually applied thStyle/tdStyle from above.
          borderCollapse ensures consistent cell borders without double-line artifacts. */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 40, textAlign: 'left' }}>#</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Description</th>
            <th style={{ ...thStyle, width: 60, textAlign: 'center' }}>Qty</th>
            <th style={{ ...thStyle, width: 110, textAlign: 'right' }}>Unit Price</th>
            <th style={{ ...thStyle, width: 110, textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={item.id}>
              <td style={tdStyle}>{i + 1}</td>
              <td style={tdStyle}>{item.description}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals -- fixed 280px column right-aligned for consistent number alignment */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {/* Tax line -- muted color to de-emphasize relative to grand total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: 'var(--ds-color-text-muted)' }}>
            <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          {/* Horizontal rule separating subtotal/tax from the grand total */}
          <div style={{ borderTop: '2px solid var(--ds-color-neutral-200, #e5e7eb)', margin: '8px 0' }} />
          {/* Grand total -- larger font makes this the visual focal point */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 18, fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes -- pre-wrap preserves user-entered line breaks in the notes field */}
      {invoice.notes && (
        <div style={{ ...sectionBg, marginTop: 32, marginBottom: 0 }}>
          <div style={labelStyle}>Notes</div>
          <div style={{ fontSize: 'var(--ds-font-size-sm, 13px)', color: 'var(--ds-color-text-muted)', whiteSpace: 'pre-wrap' }}>
            {invoice.notes}
          </div>
        </div>
      )}
    </div>
  );
}
