'use client';

/**
 * PlNotificationCenter - Panel Preset
 * Compose PatternDataTable with notification actions
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PlNotificationCenterProps, NotificationCenterItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const PanelPlNotificationCenter = createPreset<PlNotificationCenterProps>({
  name: 'PlNotificationCenter.Panel',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlNotificationCenterProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const notifColumns = useMemo(() => columns<NotificationCenterItem>([
      column('name', { header: 'Title', sortable: true }),
      column('description', { header: 'Description' }),
      column('status', {
        header: 'Status',
        sortable: true,
        render: (value) => (
          <span style={{
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: value === 'active' ? '#dcfce7' : value === 'pending' ? '#fef3c7' : '#f3f4f6',
            color: value === 'active' ? '#166534' : value === 'pending' ? '#92400e' : '#666',
          }}>
            {String(value)}
          </span>
        ),
      }),
      column('createdAt', { header: 'Created', sortable: true }),
    ]), []);

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="Notification Center"
        subtitle="Central hub for viewing, filtering, and managing all user notifications"
        actions={onCreate ? <button onClick={onCreate}>+ New</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={notifColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No notifications"
              description="Notifications will appear here."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
