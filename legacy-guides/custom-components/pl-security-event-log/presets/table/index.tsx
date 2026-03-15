'use client';

/**
 * PlSecurityEventLog - Table Preset
 * Compose PatternDataTable<SecurityEvent> with severity filters
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PlSecurityEventLogProps, SecurityEvent } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  info: { bg: '#e0e7ff', text: '#4338ca' },
  warning: { bg: '#fef3c7', text: '#92400e' },
  error: { bg: '#fecaca', text: '#991b1b' },
  critical: { bg: '#fda4af', text: '#881337' },
};

export const TablePlSecurityEventLog = createPreset<PlSecurityEventLogProps>({
  name: 'PlSecurityEventLog.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSecurityEventLogProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, events, onEventClick, emptyText } = props;

    const eventColumns = useMemo(() => columns<SecurityEvent>([
      column('type', {
        header: 'Event',
        sortable: true,
        render: (value) => String(value).replace(/_/g, ' '),
      }),
      column('severity', {
        header: 'Severity',
        sortable: true,
        render: (value) => {
          const s = String(value);
          const colors = SEVERITY_COLORS[s] ?? SEVERITY_COLORS.info;
          return (
            <span style={{
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: colors.bg,
              color: colors.text,
            }}>
              {s}
            </span>
          );
        },
      }),
      column('actor', {
        header: 'Actor',
        render: (value: any) => value?.name ?? 'System',
      }),
      column('ip', { header: 'IP' }),
      column('location', { header: 'Location' }),
      column('timestamp', {
        header: 'Time',
        sortable: true,
        render: (value) => {
          const d = value instanceof Date ? value : new Date(String(value));
          return d.toLocaleString();
        },
      }),
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
        title="Security Event Log"
        subtitle="Security event logging and monitoring with timeline and table views"
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={events}
          columns={eventColumns}
          rowKey="id"
          onRowClick={(row) => onEventClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title={emptyText ?? 'No security events found'}
              description="Security events will be logged here."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
