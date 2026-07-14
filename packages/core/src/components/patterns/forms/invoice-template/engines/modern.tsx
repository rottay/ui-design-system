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
import { panelCardStyle, pillBadgeStyle, spinnerStyle } from '../../../_internal/engines/modern/styles';

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
      <div data-part="root" data-loading="true" className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span data-part="spinner" style={spinnerStyle(24)} />
      </div>
    );
  }

  return (
    <div
      data-part="root"
      className={`max-w-3xl mx-auto ds-pattern-invoice-template ds-engine-modern ${className ?? ''}`}
      style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}
    >
      <div style={{ padding: 32 }}>
        {/* Actions */}
        {showActions && (onPrint || onExport) && (
          <div data-part="actions-bar" className="flex justify-end gap-2 mb-4 no-print">
            {onPrint && <button data-part="print-button" style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={onPrint}>Print</button>}
            {onExport && <button data-part="export-button" style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={onExport}>Export</button>}
          </div>
        )}

        {/* Header -- company branding on the left, invoice metadata on the right */}
        <div data-part="header" className="flex justify-between mb-8">
          <div>
            {/* Company logo is optional; renders above the name when provided */}
            {invoice.company.logo && (
              <img data-part="company-logo" src={invoice.company.logo} alt={invoice.company.name} className="h-12 mb-2" />
            )}
            <h2 data-part="company-name" className="text-xl font-bold">{invoice.company.name}</h2>
            {invoice.company.address && <p data-part="company-address-line" data-field="address" className="text-xs opacity-50">{invoice.company.address}</p>}
            {invoice.company.city && (
              <p data-part="company-address-line" data-field="city" className="text-xs opacity-50">
                {invoice.company.city}{invoice.company.country ? `, ${invoice.company.country}` : ''}
              </p>
            )}
            {invoice.company.taxId && <p data-part="company-address-line" data-field="taxId" className="text-xs opacity-50">Tax ID: {invoice.company.taxId}</p>}
            {invoice.company.email && <p data-part="company-address-line" data-field="email" className="text-xs opacity-50">{invoice.company.email}</p>}
          </div>
          {/* Invoice metadata -- watermark at 10% opacity creates subtle background text */}
          <div data-part="metadata" className="text-right">
            <div data-part="watermark" className="text-3xl font-extrabold opacity-10 mb-2">INVOICE</div>
            <p data-part="metadata-line" data-field="number" className="text-sm"><strong>Invoice #:</strong> {invoice.number}</p>
            <p data-part="metadata-line" data-field="date" className="text-sm"><strong>Date:</strong> {invoice.date}</p>
            {invoice.dueDate && <p data-part="metadata-line" data-field="dueDate" className="text-sm"><strong>Due:</strong> {invoice.dueDate}</p>}
            {/* Status badge -- token-styled from statusStyles map */}
            {invoice.status && (
              <span data-part="status-badge" data-status={invoice.status} className="mt-2" style={{ ...pillBadgeStyle, ...statusStyles[invoice.status] }}>
                {invoice.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Bill To -- semi-transparent base-200 background separates this from the main content */}
        <div data-part="bill-to" className="rounded-lg p-4 mb-6" style={{ background: 'var(--ds-surface-inset)' }}>
          <div data-part="section-label" className="text-xs font-semibold uppercase opacity-30 mb-1">Bill To</div>
          <div data-part="client-name" className="font-semibold">{invoice.client.name}</div>
          {invoice.client.address && <div data-part="client-address-line" data-field="address" className="text-xs opacity-50">{invoice.client.address}</div>}
          {invoice.client.city && (
            <div data-part="client-address-line" data-field="city" className="text-xs opacity-50">
              {invoice.client.city}{invoice.client.country ? `, ${invoice.client.country}` : ''}
            </div>
          )}
          {invoice.client.taxId && <div data-part="client-address-line" data-field="taxId" className="text-xs opacity-50">Tax ID: {invoice.client.taxId}</div>}
          {invoice.client.email && <div data-part="client-address-line" data-field="email" className="text-xs opacity-50">{invoice.client.email}</div>}
        </div>

        {/* Line Items -- overflow-x-auto ensures horizontal scroll on narrow viewports */}
        <div data-part="items-table-wrapper" className="overflow-x-auto mb-6">
          <table data-part="items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr data-part="items-header-row">
                <th data-part="items-header-cell" data-col="index" className="w-10">#</th>
                <th data-part="items-header-cell" data-col="description">Description</th>
                <th data-part="items-header-cell" data-col="quantity" className="text-center w-16">Qty</th>
                <th data-part="items-header-cell" data-col="unit-price" className="text-right w-28">Unit Price</th>
                <th data-part="items-header-cell" data-col="total" className="text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} data-part="items-row">
                  <td data-part="items-cell" data-col="index">{i + 1}</td>
                  <td data-part="items-cell" data-col="description">{item.description}</td>
                  <td data-part="items-cell" data-col="quantity" className="text-center">{item.quantity}</td>
                  <td data-part="items-cell" data-col="unit-price" className="text-right">{formatCurrency(item.unitPrice)}</td>
                  <td data-part="items-cell" data-col="total" className="text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals -- right-aligned fixed-width column (w-72 = 288px) for visual consistency.
            A border-top divider separates the subtotals from the grand total. */}
        <div className="flex justify-end">
          <div data-part="totals" className="w-72">
            <div data-part="totals-row" data-row="subtotal" className="flex justify-between py-1 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {/* Tax line uses reduced opacity to de-emphasize relative to total */}
            <div data-part="totals-row" data-row="tax" className="flex justify-between py-1 text-sm opacity-60">
              <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div data-part="totals-divider" style={{ borderTop: '1px solid var(--ds-color-border)', margin: '4px 0' }} />
            {/* Grand total -- larger text weight makes this the visual focal point */}
            <div data-part="totals-row" data-row="total" className="flex justify-between py-1 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes -- whitespace-pre-wrap preserves line breaks from user input */}
        {invoice.notes && (
          <div data-part="notes" className="mt-8 rounded-lg p-4" style={{ background: 'var(--ds-surface-inset)' }}>
            <div data-part="section-label" className="text-xs font-semibold uppercase opacity-30 mb-1">Notes</div>
            <p data-part="notes-text" className="text-sm opacity-70 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
