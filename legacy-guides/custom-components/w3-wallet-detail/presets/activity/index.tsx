'use client';

/**
 * W3WalletDetail - Activity Preset
 * Compose PatternTimeline for wallet activity
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { W3WalletDetailProps, WalletDetailItem } from '../../core';
import {
  PatternTimeline,
  PatternPageShell,
  PatternEmptyState,
} from '../../../../patterns';
import type { TimelineItem } from '../../../../patterns';

export const ActivityW3WalletDetail = createPreset<W3WalletDetailProps>({
  name: 'W3WalletDetail.Activity',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3WalletDetailProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    const timelineItems: TimelineItem<WalletDetailItem>[] = items.map((wallet) => ({
      key: wallet.id,
      timestamp: new Date().toISOString(),
      title: wallet.name,
      description: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} on ${wallet.network}`,
      data: wallet,
      type: wallet.status === 'connected' ? 'success'
        : wallet.status === 'pending' ? 'warning'
        : 'error',
    }));

    return (
      <PatternPageShell
        title="Wallet Activity"
        subtitle="Detailed wallet view with balance breakdown and recent activity"
        className={className}
        style={style}
        engine={engine}
      >
        <PatternTimeline
          items={timelineItems}
          onItemClick={(item) => onItemClick?.(item.data?.id ?? item.key)}
          showTimestamp
          emptyState={
            <PatternEmptyState
              title="No wallet activity"
              description="Wallet activity will appear here."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
