'use client';

/**
 * PlNotificationCenter - Popover Preset
 * Compact notification list for popover/dropdown use
 */

import { createPreset, type PresetContext } from '../../../factory';
import type { PlNotificationCenterProps, NotificationCenterItem } from '../../core';
import {
  PatternEmptyState,
} from '../../../../patterns';

export const PopoverPlNotificationCenter = createPreset<PlNotificationCenterProps>({
  name: 'PlNotificationCenter.Popover',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlNotificationCenterProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick } = props;

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100, ...style }}>
          <Spinner size="sm" />
        </div>
      );
    }

    return (
      <div className={className} style={{ maxWidth: 400, maxHeight: 480, overflow: 'auto', ...style }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.875rem' }}>
          Notifications
        </div>
        {items.length === 0 ? (
          <div style={{ padding: 24 }}>
            <PatternEmptyState
              title="All caught up"
              description="No new notifications."
              engine={engine}
            />
          </div>
        ) : (
          <div>
            {items.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onItemClick?.(notif.id)}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{notif.name}</div>
                  {notif.status === 'active' && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  {notif.description ?? ''} - {notif.createdAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
