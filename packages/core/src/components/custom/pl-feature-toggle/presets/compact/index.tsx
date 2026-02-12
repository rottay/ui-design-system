'use client';

/**
 * PlFeatureToggle - Compact Preset
 * Compose PatternDataTable with minimal columns and toggle switches
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

export const CompactPlFeatureToggle = createPreset<PlFeatureToggleProps>({
  name: 'PlFeatureToggle.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlFeatureToggleProps>) => {
    const { Spinner } = primitives;
    const { loading, className, style, items, onItemClick, onCreate } = props;

    const featureColumns = useMemo(() => columns<FeatureToggleItem>([
      column('name', { header: 'Feature', sortable: true }),
      column('status', {
        header: 'Enabled',
        render: (value, row) => (
          <div
            onClick={(e) => { e.stopPropagation(); onItemClick?.(row.id); }}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              backgroundColor: value === 'active' ? '#22c55e' : value === 'pending' ? '#f59e0b' : '#d1d5db',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: 2,
              left: value === 'active' ? 18 : 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        ),
      }),
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
        subtitle="Quick toggle interface for enabling and disabling feature flags"
        actions={onCreate ? <button onClick={onCreate}>+ New</button> : undefined}
        className={className}
        style={style}
        engine={engine}
      >
        <PatternDataTable
          data={items}
          columns={featureColumns}
          rowKey="id"
          compact
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
