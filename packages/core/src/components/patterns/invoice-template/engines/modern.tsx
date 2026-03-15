'use client';

/**
 * InvoiceTemplate - Modern Engine (DaisyUI/Tailwind)
 */

import React from 'react';
import type { InvoiceTemplateProps } from '../InvoiceTemplate.types';

const statusClasses: Record<string, string> = {
  draft: 'badge-ghost',
  sent: 'badge-info',
  paid: 'badge-success',
  overdue: 'badge-error',
};

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

  const cur = invoice.currency || '$';
  const formatCurrency = (amount: number) => `${cur}${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  return (
    <div
      className={`card bg-base-100 shadow-sm max-w-3xl mx-auto ds-pattern-invoice-template ds-engine-modern ${className ?? ''}`}
      style={style}
    >
      <div className="card-body p-8">
        {/* Actions */}
        {showActions && (onPrint || onExport) && (
          <div className="flex justify-end gap-2 mb-4 no-print">
            {onPrint && <button className="btn btn-ghost btn-sm" onClick={onPrint}>Print</button>}
            {onExport && <button className="btn btn-ghost btn-sm" onClick={onExport}>Export</button>}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
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
          <div className="text-right">
            <div className="text-3xl font-extrabold opacity-10 mb-2">INVOICE</div>
            <p className="text-sm"><strong>Invoice #:</strong> {invoice.number}</p>
            <p className="text-sm"><strong>Date:</strong> {invoice.date}</p>
            {invoice.dueDate && <p className="text-sm"><strong>Due:</strong> {invoice.dueDate}</p>}
            {invoice.status && (
              <span className={`badge ${statusClasses[invoice.status]} mt-2`}>
                {invoice.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-base-200/50 rounded-lg p-4 mb-6">
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

        {/* Line Items */}
        <div className="overflow-x-auto mb-6">
          <table className="table table-sm">
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

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-1 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm opacity-60">
              <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="divider my-1" />
            <div className="flex justify-between py-1 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 bg-base-200/50 rounded-lg p-4">
            <div className="text-xs font-semibold uppercase opacity-30 mb-1">Notes</div>
            <p className="text-sm opacity-70 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
