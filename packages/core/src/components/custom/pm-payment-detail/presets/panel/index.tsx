'use client';

/**
 * PmPaymentDetail - Panel Preset
 * Compose PatternDetailPanel<PaymentDetailItem> with metadata sidebar
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmPaymentDetailProps, PaymentDetailItem } from '../../core';
import {
  PatternDetailPanel,
  PatternTimeline,
  PatternEmptyState,
} from '../../../../patterns';
import type { DetailTab, TimelineItem } from '../../../../patterns';

export const PanelPmPaymentDetail = createPreset<PmPaymentDetailProps>({
  name: 'PmPaymentDetail.Panel',
  render: ({ primitives, props, tokens, engine }: PresetContext<PmPaymentDetailProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <PatternEmptyState
          title="No payment details"
          description="Get started by creating your first payment."
          className={className}
          style={style}
          engine={engine}
        />
      );
    }

    const item = items[0];

    const statusColor = item.status === 'completed' || item.status === 'refunded'
      ? 'green'
      : item.status === 'failed' || item.status === 'cancelled'
        ? 'red'
        : 'orange';

    const timelineItems: TimelineItem[] = items.map((entry) => ({
      key: entry.id,
      timestamp: entry.createdAt,
      title: `${entry.currency} ${entry.amount}`,
      description: entry.description ?? `${entry.method} payment - ${entry.status}`,
      type: entry.status === 'completed' ? 'success'
        : entry.status === 'failed' ? 'error'
        : entry.status === 'pending' || entry.status === 'processing' ? 'warning'
        : 'default',
    }));

    const tabs: DetailTab[] = [
      {
        key: 'overview',
        label: 'Overview',
        content: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Amount:</strong> {item.currency} {item.amount}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Method:</strong> {item.method}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Reference:</strong> {item.reference ?? 'N/A'}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Customer:</strong> {item.customer ?? 'N/A'}
            </div>
          </div>
        ),
      },
      {
        key: 'timeline',
        label: 'Timeline',
        content: (
          <PatternTimeline
            items={timelineItems}
            showTimestamp
            engine={engine}
          />
        ),
      },
    ];

    const sidebar = (
      <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Status</div>
          <div style={{ fontWeight: 600 }}>{item.status}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Created</div>
          <div>{item.createdAt}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Method</div>
          <div>{item.method}</div>
        </div>
      </div>
    );

    return (
      <PatternDetailPanel
        data={item}
        title={`Payment ${item.reference ?? item.id}`}
        subtitle={item.description ?? `${item.currency} ${item.amount}`}
        status={{ label: item.status, color: statusColor }}
        tabs={tabs}
        sidebar={sidebar}
        sidebarPosition="right"
        className={className}
        style={style}
        engine={engine}
      />
    );
  },
});
