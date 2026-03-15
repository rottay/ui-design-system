'use client';

/**
 * InvoiceTemplate - Classic Engine (Ant Design)
 */

import React from 'react';
import { Card, Button, Space, Tag, Divider, Table } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import type { InvoiceTemplateProps } from '../InvoiceTemplate.types';

const statusColors: Record<string, string> = {
  draft: 'default',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
};

export default function ClassicInvoiceTemplate(props: InvoiceTemplateProps) {
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

  const columns = [
    { title: '#', key: 'index', width: 40, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' as const },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right' as const, render: (v: number) => formatCurrency(v) },
    { title: 'Total', dataIndex: 'total', key: 'total', width: 120, align: 'right' as const, render: (v: number) => formatCurrency(v) },
  ];

  if (loading) {
    return <Card className={className} style={style} loading />;
  }

  return (
    <Card
      className={`ds-pattern-invoice-template ds-engine-classic ${className ?? ''}`}
      style={{ maxWidth: 800, margin: '0 auto', ...style }}
    >
      {/* Actions */}
      {showActions && (onPrint || onExport) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }} className="no-print">
          <Space>
            {onPrint && <Button icon={<PrinterOutlined />} onClick={onPrint}>Print</Button>}
            {onExport && <Button icon={<DownloadOutlined />} onClick={onExport}>Export</Button>}
          </Space>
        </div>
      )}

      {/* Header: Company + Invoice info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          {invoice.company.logo && (
            <img src={invoice.company.logo} alt={invoice.company.name} style={{ height: 48, marginBottom: 8 }} />
          )}
          <div style={{ fontSize: 20, fontWeight: 700 }}>{invoice.company.name}</div>
          {invoice.company.address && (
            <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>{invoice.company.address}</div>
          )}
          {invoice.company.city && (
            <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>
              {invoice.company.city}
              {invoice.company.country ? `, ${invoice.company.country}` : ''}
            </div>
          )}
          {invoice.company.taxId && (
            <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>Tax ID: {invoice.company.taxId}</div>
          )}
          {invoice.company.email && (
            <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>{invoice.company.email}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--ds-invoice-watermark-color, var(--ds-color-text-tertiary))',
              marginBottom: 8,
            }}
          >
            INVOICE
          </div>
          <div style={{ fontSize: 14 }}><strong>Invoice #:</strong> {invoice.number}</div>
          <div style={{ fontSize: 14 }}><strong>Date:</strong> {invoice.date}</div>
          {invoice.dueDate && <div style={{ fontSize: 14 }}><strong>Due:</strong> {invoice.dueDate}</div>}
          {invoice.status && (
            <Tag color={statusColors[invoice.status]} style={{ marginTop: 8 }}>
              {invoice.status.toUpperCase()}
            </Tag>
          )}
        </div>
      </div>

      {/* Bill To */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: 'var(--ds-invoice-panel-bg, var(--ds-color-bg-secondary))',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ds-invoice-label-color, var(--ds-color-text-tertiary))',
            marginBottom: 4,
          }}
        >
          Bill To
        </div>
        <div style={{ fontWeight: 600 }}>{invoice.client.name}</div>
        {invoice.client.address && <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>{invoice.client.address}</div>}
        {invoice.client.city && (
          <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>
            {invoice.client.city}
            {invoice.client.country ? `, ${invoice.client.country}` : ''}
          </div>
        )}
        {invoice.client.taxId && <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>Tax ID: {invoice.client.taxId}</div>}
        {invoice.client.email && <div style={{ fontSize: 12, color: 'var(--ds-color-text-secondary)' }}>{invoice.client.email}</div>}
      </div>

      {/* Line Items */}
      <Table
        dataSource={invoice.items}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        style={{ marginBottom: 24 }}
      />

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              fontSize: 14,
              color: 'var(--ds-color-text-secondary)',
            }}
          >
            <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 18, fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: 'var(--ds-invoice-panel-bg, var(--ds-color-bg-secondary))',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--ds-invoice-label-color, var(--ds-color-text-tertiary))',
              marginBottom: 4,
            }}
          >
            Notes
          </div>
          <div style={{ fontSize: 13, color: 'var(--ds-invoice-notes-color, var(--ds-color-text-secondary))', whiteSpace: 'pre-wrap' }}>
            {invoice.notes}
          </div>
        </div>
      )}
    </Card>
  );
}
