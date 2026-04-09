'use client';

/**
 * @fileoverview InvoiceTemplate -- Modern engine (token-driven).
 * Full invoice document rendered with DS token card, badge, and table
 * inline styles. Optimized for on-screen viewing with responsive table
 * and token-styled status indicators. Print/export actions are hidden
 * via the "no-print" CSS class for clean output.
 *
 * @example
 * <ModernInvoiceTemplate
 *   invoice={{ number: 'INV-001', date: '2026-03-01', company: { name: 'Acme' }, client: { name: 'Corp' }, items: [], subtotal: 0, tax: 0, total: 0 }}
 *   onExport={() => downloadPdf()}
 * />
 */

import React from 'react';
import type { InvoiceTemplateProps } from '../InvoiceTemplate.types';
import { panelCardStyle, pillBadgeStyle, spinnerStyle } from '../../_internal/engines/modern/styles';

/** Maps invoice status to DS token badge styles */
const statusStyles: Record<string, React.CSSProperties> = {
  draft: { background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-secondary)' },
  sent: { background: 'color-mix(in srgb, var(--ds-color-info) 15%, transparent)', color: 'var(--ds-color-info)' },
  paid: { background: 'color-mix(in srgb, var(--ds-color-success) 15%, transparent)', color: 'var(--ds-color-success)' },
  overdue: { background: 'color-mix(in srgb, var(--ds-color-error) 15%, transparent)', color: 'var(--ds-color-error)' },
};

/**
 * Modern (token-driven) implementation of the InvoiceTemplate pattern.
 * Renders a card-based invoice with responsive table, token-styled badge for
 * status, and inline styles for spacing and typography.
 *
 * @param props - See {@link InvoiceTemplateProps} for the full prop contract.
 * @returns The rendered invoice template.
 */
export default function ModernInvoiceTemplate(props: InvoiceTemplateProps) {
  const {
    invoice,
    onPrint,
    onExport,
    showActions = true,
    loading,
    className,
    style,
  } = props;

  /* Default currency symbol when none provided */
  const cur = invoice.currency || '$';
  const formatCurrency = (amount: number) => `${cur}${amount.toFixed(2)}`;

  /* Loading spinner centered in the card footprint */
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span style={spinnerStyle(24)} />
      </div>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto ds-pattern-invoice-template ds-engine-modern ${className ?? ''}`}
      style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}
    >
      <div style={{ padding: 32 }}>
        {/* Actions */}
        {showActions && (onPrint || onExport) && (
          <div className="flex justify-end gap-2 mb-4 no-print">
            {onPrint && <button style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={onPrint}>Print</button>}
            {onExport && <button style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={onExport}>Export</button>}
          </div>
        )}

        {/* Header -- company branding on the left, invoice metadata on the right */}
        <div className="flex justify-between mb-8">
          <div>
            {/* Company logo is optional; renders above the name when provided */}
            {invoice.company.logo && (
              <img src={invoice.company.logo} alt={invoice.company.name} className="h-12 mb-2" />
            )}
            <h2 className="text-xl font-bold">{invoice.company.name}</h2>
            {invoice.company.address && <p className="text-xs opacity-50">{invoice.company.address}</p>}
            {invoice.company.city && (
              <p className="text-xs opacity-50">
                {invoice.company.city}{invoice.company.country ? `, ${invoice.company.country}` : ''}
              </p>
            )}
            {invoice.company.taxId && <p className="text-xs opacity-50">Tax ID: {invoice.company.taxId}</p>}
            {invoice.company.email && <p className="text-xs opacity-50">{invoice.company.email}</p>}
          </div>
          {/* Invoice metadata -- watermark at 10% opacity creates subtle background text */}
          <div className="text-right">
            <div className="text-3xl font-extrabold opacity-10 mb-2">INVOICE</div>
            <p className="text-sm"><strong>Invoice #:</strong> {invoice.number}</p>
            <p className="text-sm"><strong>Date:</strong> {invoice.date}</p>
            {invoice.dueDate && <p className="text-sm"><strong>Due:</strong> {invoice.dueDate}</p>}
            {/* Status badge -- token-styled from statusStyles map */}
            {invoice.status && (
              <span className="mt-2" style={{ ...pillBadgeStyle, ...statusStyles[invoice.status] }}>
                {invoice.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Bill To -- semi-transparent base-200 background separates this from the main content */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--ds-surface-inset)' }}>
          <div className="text-xs font-semibold uppercase opacity-30 mb-1">Bill To</div>
          <div className="font-semibold">{invoice.client.name}</div>
          {invoice.client.address && <div className="text-xs opacity-50">{invoice.client.address}</div>}
          {invoice.client.city && (
            <div className="text-xs opacity-50">
              {invoice.client.city}{invoice.client.country ? `, ${invoice.client.country}` : ''}
            </div>
          )}
          {invoice.client.taxId && <div className="text-xs opacity-50">Tax ID: {invoice.client.taxId}</div>}
          {invoice.client.email && <div className="text-xs opacity-50">{invoice.client.email}</div>}
        </div>

        {/* Line Items -- overflow-x-auto ensures horizontal scroll on narrow viewports */}
        <div className="overflow-x-auto mb-6">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Description</th>
                <th className="text-center w-16">Qty</th>
                <th className="text-right w-28">Unit Price</th>
                <th className="text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.description}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals -- right-aligned fixed-width column (w-72 = 288px) for visual consistency.
            A border-top divider separates the subtotals from the grand total. */}
        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-1 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {/* Tax line uses reduced opacity to de-emphasize relative to total */}
            <div className="flex justify-between py-1 text-sm opacity-60">
              <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--ds-color-border)', margin: '4px 0' }} />
            {/* Grand total -- larger text weight makes this the visual focal point */}
            <div className="flex justify-between py-1 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes -- whitespace-pre-wrap preserves line breaks from user input */}
        {invoice.notes && (
          <div className="mt-8 rounded-lg p-4" style={{ background: 'var(--ds-surface-inset)' }}>
            <div className="text-xs font-semibold uppercase opacity-30 mb-1">Notes</div>
            <p className="text-sm opacity-70 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
