'use client';

/**
 * W3TransactionHistory - Timeline Preset
 * Compose PatternTimeline<TransactionHistoryItem>
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { W3TransactionHistoryProps, TransactionHistoryItem } from '../../core';
import {
  PatternTimeline,
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';
import type { TimelineItem } from '../../../../patterns';

export const TimelineW3TransactionHistory = createPreset<W3TransactionHistoryProps>({
  name: 'W3TransactionHistory.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3TransactionHistoryProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    const timelineItems: TimelineItem<TransactionHistoryItem>[] = items.map((tx) => ({
      key: tx.id,
      timestamp: tx.timestamp,
      title: `${tx.type} - ${tx.value}`,
      description: `${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)} on ${tx.network}`,
      data: tx,
      type: tx.status === 'confirmed' ? 'success'
        : tx.status === 'failed' || tx.status === 'dropped' ? 'error'
        : 'warning',
    }));

    return (
      <PatternPageShell
        title="Transaction History"
        subtitle="Browse blockchain transaction history with filtering, status, and explorer links"
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
              title="No transactions found"
              description="Transaction history will appear here."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
