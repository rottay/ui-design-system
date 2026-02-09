'use client';

/**
 * W3StakingPoolManager - Table Preset
 * Create and manage staking pools with APY, lock periods, and capacity settings
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { W3StakingPoolManagerProps } from '../../core';

export const TableW3StakingPoolManager = createPreset<W3StakingPoolManagerProps>({
  name: 'W3StakingPoolManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<W3StakingPoolManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;
    const { loading, className, style, ...rest } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const containerStyle = useMemo(() => ({
      padding: tokens.spacing[6],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      fontFamily: 'inherit',
    }), [tokens]);

    const headerStyle = useMemo(() => ({
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.neutral[900],
      margin: 0,
      lineHeight: tokens.typography.lineHeight.tight,
    }), [tokens]);

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isModern,
    }), [tokens, isModern]);

    const items = (rest as any).items ?? (rest as any).methods ?? (rest as any).sessions ?? (rest as any).metrics ?? [];

    if (loading) {
      return (
        <div className={className} style={{ ...containerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <div className={className} style={{ ...containerStyle, ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[6] }}>
          <div>
            <h2 style={headerStyle}>Staking Pool Manager</h2>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: 0, marginTop: tokens.spacing[1] }}>
              Create and manage staking pools with APY, lock periods, and capacity settings
            </p>
          </div>
          {(rest as any).onCreate || (rest as any).onAdd || (rest as any).onConnect || (rest as any).onDeploy || (rest as any).onInitiate ? (
            <button
              onClick={(rest as any).onCreate ?? (rest as any).onAdd ?? (rest as any).onConnect ?? (rest as any).onDeploy ?? (rest as any).onInitiate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
              }}
            >
              + New
            </button>
          ) : null}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div style={{ ...createEmptyStateStyle(tokens), ...cardStyle, padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px` }}>
            <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[2] }}>
              No items found
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              Get started by creating your first item.
            </div>
          </div>
        ) : (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                  {Object.keys(items[0] || {}).filter(k => k !== 'id').slice(0, 5).map((key) => (
                    <th key={key} style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      textAlign: 'left' as const,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr
                    key={item.id || idx}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => (rest as any).onItemClick?.(item.id)}
                    style={{
                      backgroundColor: hoveredId === item.id ? tokens.colors.neutral[50] : tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {Object.entries(item).filter(([k]) => k !== 'id').slice(0, 5).map(([key, val]) => (
                      <td key={key} style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: key === 'status'
                          ? ((val === 'active' || val === 'connected' || val === 'completed' || val === 'delivered' || val === 'paid' || val === 'confirmed' || val === 'minted') ? tokens.colors.successScale[600]
                            : (val === 'failed' || val === 'inactive' || val === 'expired' || val === 'rejected' || val === 'down' || val === 'cancelled' || val === 'revoked' || val === 'burned' || val === 'dropped') ? tokens.colors.errorScale[600]
                            : (val === 'pending' || val === 'processing' || val === 'trialing' || val === 'in_transit' || val === 'retrying' || val === 'paused') ? tokens.colors.warningScale[600]
                            : tokens.colors.neutral[700])
                          : tokens.colors.neutral[700],
                        fontWeight: key === 'name' || key === 'title' || key === 'status' ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                        borderBottom: idx < items.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      }}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  },
});
