'use client';

/**
 * @fileoverview InvoiceTemplate -- Modern engine (token-driven).
 *
 * Print-ready invoice document that COMPOSES certified DS primitives and
 * never recreates them:
 * - Button (print / export actions) -- the hand-rolled native `<button>`
 *   pair is retired.
 * - Spinner (loading) -- the hand-rolled inline spinnerStyle is retired.
 * - Tag (status badge) -- the semantic variant carries the tint (draft /
 *   sent / paid / overdue) while the pinned uppercase status text stays the
 *   DOM copy; the badge is never colour-alone (Tag shape + text).
 * - Empty (no line items) -- a shaped row inside the table, never a mute
 *   empty table.
 *
 * The line-items TABLE stays pattern-owned on purpose: it is a static
 * document table for print, not an interactive data grid -- the DS Table
 * primitive's contract (sorting, pagination, selection chrome) has no
 * mapping here. Column alignment and tabular figures live in the skin.
 *
 * Structural labels (invoice/date/due/bill-to/totals/columns/actions/empty)
 * are pattern-owned copy and resolve through the optional `components` i18n
 * channel with an English floor; the invoice DATA is always the consumer's.
 * The shared `panelCardStyle` kit (patterns/foundation/engine-styles) still
 * arrives inline on the root -- it is shared with ten consumers fleet-wide
 * and is outside this family's write-set.
 *
 * Currency: with an ISO 4217 `invoice.currency` the format is locale-aware
 * (`Intl.NumberFormat`, never a hardcoded symbol). Without it, the legacy
 * `'$' + toFixed(2)` floor applies byte-for-byte -- the public test
 * contract pins `'$600.00'` for the no-currency case, so that floor is
 * load-bearing until the pin migrates to a currency-provided case.
 *
 * @example
 * <ModernInvoiceTemplate
 *   invoice={{ number: 'INV-001', date: '2026-03-01', company: { name: 'Acme' }, client: { name: 'Corp' }, items: [], subtotal: 0, tax: 0, total: 0 }}
 *   onExport={() => downloadPdf()}
 * />
 */

import React from 'react';
import type { InvoiceTemplateProps } from '../../contracts';
import { panelCardStyle } from '../../../../foundation/engine-styles/modern';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import ModernTag from '../../../../../primitives/display/Tag/engines/modern';
import ModernEmpty from '../../../../../primitives/display/Empty/engines/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Status → Tag semantic variant (the uppercase status TEXT stays the DOM
    copy -- the public test pins 'SENT' -- while the variant carries the
    tint; the badge is never colour-alone). */
const STATUS_TAG_VARIANT = {
  draft: 'default',
  sent: 'primary',
  paid: 'success',
  overdue: 'error',
} as const;

/**
 * Modern (token-driven) implementation of the InvoiceTemplate pattern.
 * Renders a print-ready invoice document composed of DS primitives with all
 * geometry and paint owned by the modern invoice-template skin.
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

  // Optional channel with an English floor: the document renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  const copy = {
    print: tOr('invoice_template.print', 'Print'),
    export: tOr('invoice_template.export', 'Export'),
    watermark: tOr('invoice_template.watermark', 'Invoice'),
    numberLabel: tOr('invoice_template.number_label', 'Invoice #:'),
    dateLabel: tOr('invoice_template.date_label', 'Date:'),
    dueLabel: tOr('invoice_template.due_label', 'Due:'),
    taxIdLabel: tOr('invoice_template.tax_id_label', 'Tax ID:'),
    billTo: tOr('invoice_template.bill_to', 'Bill To'),
    notesLabel: tOr('invoice_template.notes_label', 'Notes'),
    subtotal: tOr('invoice_template.subtotal', 'Subtotal'),
    total: tOr('invoice_template.total', 'Total'),
    colDescription: tOr('invoice_template.col_description', 'Description'),
    colQuantity: tOr('invoice_template.col_quantity', 'Qty'),
    colUnitPrice: tOr('invoice_template.col_unit_price', 'Unit Price'),
    colTotal: tOr('invoice_template.col_total', 'Total'),
    emptyItems: tOr('invoice_template.empty_items', 'No line items'),
  };

  // Currency: ISO 4217 contract → locale-aware Intl format (never a
  // hardcoded symbol). Without a currency code the legacy pinned floor
  // applies byte-for-byte ('$' + toFixed(2)); an unrecognised code degrades
  // to the same floor instead of throwing.
  const formatCurrency = (amount: number): string => {
    if (invoice.currency) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: invoice.currency,
        }).format(amount);
      } catch {
        /* fall through to the legacy floor */
      }
    }
    return `$${amount.toFixed(2)}`;
  };

  /* Loading: the composed Spinner owns ring and cadence; the skin owns the
     centering frame. The scope classes ride the loading root too, with the
     skin's elevation guarded on data-loading='false' (the loading state
     never had an elevation -- that contract is preserved). */
  if (loading) {
    return (
      <div
        data-part="root"
        data-loading="true"
        className={`ds-pattern-invoice-template ds-engine-modern ${className ?? ''}`}
        style={style}
      >
        <ModernSpinner data-part="spinner" size="md" />
      </div>
    );
  }

  return (
    <div
      data-part="root"
      data-loading="false"
      className={`ds-pattern-invoice-template ds-engine-modern ${className ?? ''}`}
      style={{ ...panelCardStyle, ...style }}
    >
      <div data-part="document">
        {/* Actions: composed Buttons; hidden in print output by the skin's
            @media print rule (the no-print hook stays for consumer sheets). */}
        {showActions && (onPrint || onExport) && (
          <div data-part="actions-bar" className="no-print">
            {onPrint && (
              <ModernButton
                data-part="print-button"
                variant="ghost"
                size="sm"
                onClick={onPrint}
              >
                {copy.print}
              </ModernButton>
            )}
            {onExport && (
              <ModernButton
                data-part="export-button"
                variant="ghost"
                size="sm"
                onClick={onExport}
              >
                {copy.export}
              </ModernButton>
            )}
          </div>
        )}

        {/* Header -- company branding on the start side, invoice metadata on
            the end side (flips with RTL via the skin). */}
        <div data-part="header">
          <div data-part="company">
            {/* Company logo is optional; renders above the name when provided */}
            {invoice.company.logo && (
              <img data-part="company-logo" src={invoice.company.logo} alt={invoice.company.name} />
            )}
            <h2 data-part="company-name">{invoice.company.name}</h2>
            {invoice.company.address && <p data-part="company-address-line" data-field="address">{invoice.company.address}</p>}
            {invoice.company.city && (
              <p data-part="company-address-line" data-field="city">
                {invoice.company.city}{invoice.company.country ? `, ${invoice.company.country}` : ''}
              </p>
            )}
            {invoice.company.taxId && <p data-part="company-address-line" data-field="taxId">{copy.taxIdLabel} {invoice.company.taxId}</p>}
            {invoice.company.email && <p data-part="company-address-line" data-field="email">{invoice.company.email}</p>}
          </div>
          {/* Invoice metadata -- watermark as quiet background text */}
          <div data-part="metadata">
            <div data-part="watermark" aria-hidden="true">{copy.watermark}</div>
            <p data-part="metadata-line" data-field="number"><strong>{copy.numberLabel}</strong> {invoice.number}</p>
            <p data-part="metadata-line" data-field="date"><strong>{copy.dateLabel}</strong> {invoice.date}</p>
            {invoice.dueDate && <p data-part="metadata-line" data-field="dueDate"><strong>{copy.dueLabel}</strong> {invoice.dueDate}</p>}
            {/* Status badge: composed Tag; the pinned uppercase status text
                stays the DOM copy, the variant carries the tint. */}
            {invoice.status && (
              <span data-part="status-badge" data-status={invoice.status}>
                <ModernTag variant={STATUS_TAG_VARIANT[invoice.status]}>
                  {invoice.status.toUpperCase()}
                </ModernTag>
              </span>
            )}
          </div>
        </div>

        {/* Bill To -- inset panel separates this from the main content */}
        <div data-part="bill-to">
          <div data-part="section-label">{copy.billTo}</div>
          <div data-part="client-name">{invoice.client.name}</div>
          {invoice.client.address && <div data-part="client-address-line" data-field="address">{invoice.client.address}</div>}
          {invoice.client.city && (
            <div data-part="client-address-line" data-field="city">
              {invoice.client.city}{invoice.client.country ? `, ${invoice.client.country}` : ''}
            </div>
          )}
          {invoice.client.taxId && <div data-part="client-address-line" data-field="taxId">{copy.taxIdLabel} {invoice.client.taxId}</div>}
          {invoice.client.email && <div data-part="client-address-line" data-field="email">{invoice.client.email}</div>}
        </div>

        {/* Line Items -- pattern-owned document table (see the fileoverview
            for why the DS Table primitive is not composed here); the wrapper
            keeps horizontal scroll on narrow compositions. */}
        <div data-part="items-table-wrapper">
          <table data-part="items-table">
            {/* The table's accessible name: the localized document label,
                one string — never a concatenation of translated fragments. */}
            <caption className="ds-visually-hidden">{copy.watermark}</caption>
            <thead>
              <tr data-part="items-header-row">
                <th scope="col" data-part="items-header-cell" data-col="index">#</th>
                <th scope="col" data-part="items-header-cell" data-col="description">{copy.colDescription}</th>
                <th scope="col" data-part="items-header-cell" data-col="quantity">{copy.colQuantity}</th>
                <th scope="col" data-part="items-header-cell" data-col="unit-price">{copy.colUnitPrice}</th>
                <th scope="col" data-part="items-header-cell" data-col="total">{copy.colTotal}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                /* Empty: a shaped row, never a mute empty table -- the
                   composed Empty primitive owns the quiet hint. */
                <tr data-part="items-empty">
                  <td colSpan={5}>
                    <ModernEmpty description={copy.emptyItems} />
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, i) => (
                  <tr key={item.id} data-part="items-row">
                    <td data-part="items-cell" data-col="index">{i + 1}</td>
                    <td data-part="items-cell" data-col="description">{item.description}</td>
                    <td data-part="items-cell" data-col="quantity">{item.quantity}</td>
                    <td data-part="items-cell" data-col="unit-price">{formatCurrency(item.unitPrice)}</td>
                    <td data-part="items-cell" data-col="total">{formatCurrency(item.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals -- end-aligned fixed-measure column; a hairline separates
            the subtotals from the grand total. */}
        <div data-part="totals">
          <div data-part="totals-row" data-row="subtotal">
            <span>{copy.subtotal}</span>
            <span data-part="totals-value">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {/* Tax line de-emphasized relative to the grand total */}
          <div data-part="totals-row" data-row="tax">
            <span>
              {invoice.taxRate != null
                ? tOr('invoice_template.tax_with_rate', 'Tax ({rate}%)', { rate: invoice.taxRate })
                : tOr('invoice_template.tax', 'Tax')}
            </span>
            <span data-part="totals-value">{formatCurrency(invoice.tax)}</span>
          </div>
          <div data-part="totals-divider" />
          {/* Grand total -- larger weight makes this the visual focal point */}
          <div data-part="totals-row" data-row="total">
            <span>{copy.total}</span>
            <span data-part="totals-value">{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {/* Notes -- whitespace: pre-wrap preserves line breaks from user
            input; the skin caps the measure for readability. */}
        {invoice.notes && (
          <div data-part="notes">
            <div data-part="section-label">{copy.notesLabel}</div>
            <p data-part="notes-text">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
