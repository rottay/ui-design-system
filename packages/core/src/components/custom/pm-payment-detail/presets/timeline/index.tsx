'use client';

/**
 * PmPaymentDetail - Timeline Preset
 * Compose PatternTimeline with payment events
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PmPaymentDetailProps, PaymentDetailItem } from '../../core';
import {
  PatternTimeline,
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';
import type { TimelineItem } from '../../../../patterns';

export const TimelinePmPaymentDetail = createPreset<PmPaymentDetailProps>({
  name: 'PmPaymentDetail.Timeline',
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

    const timelineItems: TimelineItem<PaymentDetailItem>[] = items.map((entry) => ({
      key: entry.id,
      timestamp: entry.createdAt,
      title: `${entry.currency} ${entry.amount}`,
      description: entry.description ?? `${entry.method} - ${entry.customer ?? 'Unknown'}`,
      data: entry,
      type: entry.status === 'completed' ? 'success'
        : entry.status === 'failed' || entry.status === 'cancelled' ? 'error'
        : entry.status === 'pending' || entry.status === 'processing' ? 'warning'
        : 'info',
    }));

    return (
      <PatternPageShell
        title="Payment Detail"
        subtitle="View payment details with transaction timeline, refund history, and metadata"
        actions={onCreate ? <button onClick={onCreate}>+ New</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternTimeline
          items={timelineItems}
          onItemClick={(item) => onItemClick?.(item.data?.id ?? item.key)}
          showTimestamp
          groupByDate
          emptyState={
            <PatternEmptyState
              title="No payment events"
              description="Payment timeline will appear here once transactions are created."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
