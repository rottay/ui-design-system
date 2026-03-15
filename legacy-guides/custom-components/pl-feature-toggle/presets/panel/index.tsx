'use client';

/**
 * PlFeatureToggle - Panel Preset
 * Compose PatternDataTable with toggle switches
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { PlFeatureToggleProps, FeatureToggleItem } from '../../core';
import {
  PatternDataTable,
  PatternEmptyState,
  PatternPageShell,
  column,
  columns,
} from '../../../../patterns';

export const PanelPlFeatureToggle = createPreset<PlFeatureToggleProps>({
  name: 'PlFeatureToggle.Panel',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlFeatureToggleProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const featureColumns = useMemo(() => columns<FeatureToggleItem>([
      column('name', { header: 'Feature', sortable: true }),
      column('description', { header: 'Description' }),
      column('status', {
        header: 'Status',
        sortable: true,
        render: (value, row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              backgroundColor: value === 'active' ? '#22c55e' : value === 'pending' ? '#f59e0b' : '#d1d5db',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
              onClick={(e) => { e.stopPropagation(); onItemClick?.(row.id); }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: 2,
                left: value === 'active' ? 18 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>{String(value)}</span>
          </div>
        ),
      }),
      column('updatedAt', { header: 'Updated' }),
    ]), [onItemClick]);

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <PatternPageShell
        title="Feature Toggles"
        subtitle="Quick toggle interface for enabling and disabling feature flags per environment"
        actions={onCreate ? <button onClick={onCreate}>+ New Feature</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={featureColumns}
          rowKey="id"
          onRowClick={(row) => onItemClick?.(row.id)}
          hoverable
          emptyState={
            <PatternEmptyState
              title="No feature flags"
              description="Create your first feature flag to get started."
              engine={engine}
            />
          }
          engine={engine}
        />
      </PatternPageShell>
    );
  },
});
